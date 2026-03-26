import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyOverridesToSchema,
  normalizeVideoOptions,
  parseTemplateSchema,
  safeImageFormat,
  safeVideoFormat,
} from '../services/schemaUtils.js';

test('parseTemplateSchema width/height fallback works', () => {
  const template = {
    width: 1200,
    height: 628,
    schema: JSON.stringify({ background: '#fff', layers: [] }),
  };

  const parsed = parseTemplateSchema(template);
  assert.equal(parsed.width, 1200);
  assert.equal(parsed.height, 628);
  assert.equal(parsed.background, '#fff');
});

test('applyOverridesToSchema only updates variable layers', () => {
  const schema = {
    background: '#fff',
    width: 1080,
    height: 1080,
    layers: [
      { id: 'a', type: 'text', text: 'A', variable: 'title' },
      { id: 'b', type: 'text', text: 'B' },
      { id: 'c', type: 'image', src: 'x.png', variable: 'hero' },
    ],
  };

  const overridden = applyOverridesToSchema(schema, {
    title: 'Yeni Baslik',
    hero: 'hero-new.png',
  });

  assert.equal(overridden.layers[0].text, 'Yeni Baslik');
  assert.equal(overridden.layers[1].text, 'B');
  assert.equal(overridden.layers[2].src, 'hero-new.png');
});

test('format and video options are normalized safely', () => {
  assert.equal(safeImageFormat('jpg'), 'jpeg');
  assert.equal(safeImageFormat('bmp'), 'png');
  assert.equal(safeVideoFormat('avi'), 'mp4');

  const normalized = normalizeVideoOptions({ fps: 200, durationSeconds: -1 });
  assert.equal(normalized.fps, 60);
  assert.equal(normalized.durationSeconds, 1);
  assert.equal(normalized.durationInFrames, 60);
});
