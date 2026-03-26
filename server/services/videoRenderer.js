import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import {
  applyOverridesToSchema,
  normalizeVideoOptions,
  parseTemplateSchema,
  safeVideoFormat,
} from './schemaUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const remotionEntry = path.join(rootDir, 'server', 'remotion', 'entry.jsx');

let serveUrlPromise = null;

async function getServeUrl() {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint: remotionEntry,
      webpackOverride: (config) => config,
    });
  }

  return serveUrlPromise;
}

export async function renderTemplateToVideo({
  renderId,
  template,
  overrides,
  format = 'mp4',
  fps = 30,
  durationSeconds = 10,
}) {
  const schema = applyOverridesToSchema(parseTemplateSchema(template), overrides);
  const videoOptions = normalizeVideoOptions({ fps, durationSeconds });
  const safeFormat = safeVideoFormat(format);

  const outputDir = path.join(rootDir, 'outputs');
  await fs.mkdir(outputDir, { recursive: true });

  const fileName = `render_${renderId}.${safeFormat}`;
  const absoluteOutputPath = path.join(outputDir, fileName);

  const serveUrl = await getServeUrl();
  const inputProps = {
    schema,
    fps: videoOptions.fps,
    durationInFrames: videoOptions.durationInFrames,
    width: Number(schema.width || template.width || 1080),
    height: Number(schema.height || template.height || 1080),
  };

  const composition = await selectComposition({
    serveUrl,
    id: 'RenderForgeComposition',
    inputProps,
  });

  await renderMedia({
    serveUrl,
    composition,
    codec: safeFormat === 'gif' ? 'gif' : 'h264',
    outputLocation: absoluteOutputPath,
    inputProps,
    chromiumOptions: {
      ignoreCertificateErrors: true,
      gl: 'angle',
    },
  });

  return {
    outputPath: absoluteOutputPath,
    outputRelativePath: `/outputs/${fileName}`,
  };
}
