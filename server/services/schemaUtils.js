function ensureNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseTemplateSchema(template) {
  const rawSchema =
    typeof template.schema === 'string' ? JSON.parse(template.schema) : template.schema;

  return {
    background: rawSchema?.background || '#ffffff',
    width: ensureNumber(template.width ?? rawSchema?.width, 1080),
    height: ensureNumber(template.height ?? rawSchema?.height, 1080),
    layers: Array.isArray(rawSchema?.layers) ? rawSchema.layers : [],
  };
}

export function applyOverridesToSchema(schema, overrides = {}) {
  const layers = (schema.layers || []).map((layer) => {
    if (!layer.variable) {
      return layer;
    }

    const overrideValue = overrides[layer.variable];
    if (overrideValue === undefined || overrideValue === null) {
      return layer;
    }

    if (layer.type === 'text') {
      return { ...layer, text: String(overrideValue) };
    }

    if (layer.type === 'image') {
      return { ...layer, src: String(overrideValue) };
    }

    return { ...layer, value: overrideValue };
  });

  return {
    ...schema,
    layers,
  };
}

export function safeImageFormat(format = 'png') {
  const normalized = String(format || 'png').toLowerCase();
  if (normalized === 'jpg') {
    return 'jpeg';
  }
  return ['png', 'jpeg', 'webp'].includes(normalized) ? normalized : 'png';
}

export function safeVideoFormat(format = 'mp4') {
  const normalized = String(format || 'mp4').toLowerCase();
  return ['mp4', 'gif'].includes(normalized) ? normalized : 'mp4';
}

export function normalizeVideoOptions({ fps = 30, durationSeconds = 10 }) {
  const safeFps = Math.max(10, Math.min(60, ensureNumber(fps, 30)));
  const safeDuration = Math.max(1, Math.min(30, ensureNumber(durationSeconds, 10)));

  return {
    fps: safeFps,
    durationSeconds: safeDuration,
    durationInFrames: Math.round(safeFps * safeDuration),
  };
}
