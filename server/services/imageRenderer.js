import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import {
  applyOverridesToSchema,
  parseTemplateSchema,
  safeImageFormat,
} from './schemaUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function layerToHtml(layer) {
  const common = [
    'position:absolute',
    `left:${Number(layer.x || 0)}px`,
    `top:${Number(layer.y || 0)}px`,
    `opacity:${layer.opacity ?? 1}`,
    `z-index:${layer.zIndex ?? 0}`,
  ];

  if (layer.width) {
    common.push(`width:${Number(layer.width)}px`);
  }
  if (layer.height) {
    common.push(`height:${Number(layer.height)}px`);
  }

  if (layer.type === 'text') {
    return `<div style="${[
      ...common,
      `font-size:${Number(layer.fontSize || 32)}px`,
      `font-family:${escapeHtml(layer.fontFamily || 'Inter, Arial, sans-serif')}`,
      `font-weight:${escapeHtml(layer.fontWeight || 'normal')}`,
      `font-style:${layer.italic ? 'italic' : 'normal'}`,
      `text-decoration:${layer.underline ? 'underline' : 'none'}`,
      `color:${escapeHtml(layer.color || '#ffffff')}`,
      `text-align:${escapeHtml(layer.textAlign || 'left')}`,
      'white-space:pre-wrap',
    ].join(';')}">${escapeHtml(layer.text || '')}</div>`;
  }

  if (layer.type === 'image') {
    return `<img src="${escapeHtml(layer.src || '')}" style="${[
      ...common,
      'object-fit:cover',
    ].join(';')}" />`;
  }

  if (layer.type === 'circle') {
    return `<div style="${[
      ...common,
      `background:${escapeHtml(layer.fill || '#3b82f6')}`,
      `border:${Number(layer.strokeWidth || 0)}px solid ${escapeHtml(layer.stroke || 'transparent')}`,
      'border-radius:9999px',
    ].join(';')}"></div>`;
  }

  return `<div style="${[
    ...common,
    `background:${escapeHtml(layer.fill || '#3b82f6')}`,
    `border:${Number(layer.strokeWidth || 0)}px solid ${escapeHtml(layer.stroke || 'transparent')}`,
    `border-radius:${Number(layer.cornerRadius || 0)}px`,
  ].join(';')}"></div>`;
}

function schemaToHtml(schema) {
  const sortedLayers = [...(schema.layers || [])].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      body {
        width: ${schema.width}px;
        height: ${schema.height}px;
      }
      #canvas-root {
        position: relative;
        width: ${schema.width}px;
        height: ${schema.height}px;
        overflow: hidden;
        background: ${schema.background || '#ffffff'};
      }
      * {
        box-sizing: border-box;
      }
    </style>
  </head>
  <body>
    <div id="canvas-root">
      ${sortedLayers.map(layerToHtml).join('\\n')}
    </div>
  </body>
</html>`;
}

export async function renderTemplateToImage({
  renderId,
  template,
  overrides,
  format = 'png',
}) {
  const schema = applyOverridesToSchema(parseTemplateSchema(template), overrides);

  const html = schemaToHtml(schema);
  const safeFormat = safeImageFormat(format);

  const outputDir = path.join(rootDir, 'outputs');
  await fs.mkdir(outputDir, { recursive: true });

  const fileName = `render_${renderId}.${safeFormat}`;
  const absoluteOutputPath = path.join(outputDir, fileName);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: Number(template.width || 1080),
      height: Number(template.height || 1080),
      deviceScaleFactor: 1,
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: absoluteOutputPath,
      type: safeFormat === 'jpeg' ? 'jpeg' : safeFormat,
      quality: safeFormat === 'jpeg' || safeFormat === 'webp' ? 90 : undefined,
      omitBackground: false,
    });
  } finally {
    await browser.close();
  }

  return {
    outputPath: absoluteOutputPath,
    outputRelativePath: `/outputs/${fileName}`,
  };
}
