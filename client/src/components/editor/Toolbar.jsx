import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { useEditorStore } from '../../store/editorStore.js';

function resolveAssetSrc(asset) {
  if (asset?.path?.startsWith('/')) {
    return asset.path;
  }

  if (asset?.url) {
    try {
      const parsed = new URL(asset.url, window.location.origin);
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return asset.url;
    }
  }

  return '';
}

function readImageSize(file) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width || 1,
        height: image.naturalHeight || image.height || 1,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      resolve({ width: 1, height: 1 });
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });
}

const canvasSizes = [
  { label: '1080x1080', width: 1080, height: 1080 },
  { label: '1920x1080', width: 1920, height: 1080 },
  { label: '1080x1920', width: 1080, height: 1920 },
  { label: '1280x720', width: 1280, height: 720 },
];

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 6h14" />
      <path d="M12 6v12" />
      <path d="M8.5 18h7" />
    </svg>
  );
}

function RectangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="6" width="15" height="12" rx="2.5" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <path d="m8 16 3.2-3 2.5 2.2 2.3-2.2L19 16" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 8H5v4" />
      <path d="M5 12c1.8-3 4.4-4.5 7.8-4.5A7.2 7.2 0 0 1 20 14.7" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 8h4v4" />
      <path d="M19 12c-1.8-3-4.4-4.5-7.8-4.5A7.2 7.2 0 0 0 4 14.7" />
    </svg>
  );
}

function RenderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CoverIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M5 9h14" opacity="0.95" />
      <path d="m8 15 2.6-2.5 2.2 2 2.2-2.1L19 16" />
    </svg>
  );
}

const layerQuickAddActions = [
  { type: 'text', title: 'Text Ekle', label: 'Text', Icon: TextIcon },
  { type: 'rect', title: 'Dikdörtgen Ekle', label: 'Dikdörtgen', Icon: RectangleIcon },
  { type: 'circle', title: 'Daire Ekle', label: 'Daire', Icon: CircleIcon },
];

export default function Toolbar({ onOpenRender }) {
  const template = useEditorStore((state) => state.template);
  const setTemplateMeta = useEditorStore((state) => state.setTemplateMeta);
  const addLayer = useEditorStore((state) => state.addLayer);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const selectedLayer = useEditorStore((state) =>
    state.template.layers.find((layer) => layer.id === state.selectedLayerId)
  );
  const makeImageBackground = useEditorStore((state) => state.makeImageBackground);
  const historyCount = useEditorStore((state) => state.history.length);
  const futureCount = useEditorStore((state) => state.future.length);

  const uploadInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [customWidth, setCustomWidth] = useState(template.width);
  const [customHeight, setCustomHeight] = useState(template.height);

  useEffect(() => {
    setCustomWidth(template.width);
    setCustomHeight(template.height);
  }, [template.height, template.width]);

  async function saveTemplate() {
    setSaving(true);
    setError('');

    const body = {
      name: template.name || 'Yeni Template',
      width: template.width,
      height: template.height,
      schema: {
        background: template.background,
        width: template.width,
        height: template.height,
        layers: template.layers,
      },
    };

    try {
      const payload = template.id
        ? await api.updateTemplate(template.id, body)
        : await api.createTemplate(body);

      setTemplate(payload.data);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssetUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError('');
    try {
      const [{ width: imageWidth, height: imageHeight }, payload] = await Promise.all([
        readImageSize(file),
        api.uploadAsset(file),
      ]);

      const maxWidth = Math.max(220, Math.round(template.width * 0.9));
      const maxHeight = Math.max(220, Math.round(template.height * 0.72));
      const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1);
      const width = Math.max(120, Math.round(imageWidth * scale));
      const height = Math.max(120, Math.round(imageHeight * scale));

      addLayer('image', {
        src: resolveAssetSrc(payload.data),
        width,
        height,
        x: Math.max(0, Math.round((template.width - width) / 2)),
        y: Math.max(0, Math.round((template.height - height) / 2)),
      });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  const sizeValue = `${template.width}x${template.height}`;
  const matchedSize = canvasSizes.find((item) => item.label === sizeValue);

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-top panel">
        <input
          className="button toolbar-template-name"
          value={template.name}
          onChange={(event) =>
            setTemplateMeta({ name: event.target.value }, { recordHistory: false })
          }
          placeholder="Template adı"
        />
        <div className="editor-toolbar-top-actions">
          <button
            className="button toolbar-action-undo toolbar-top-btn"
            type="button"
            onClick={undo}
            disabled={!historyCount}
          >
            <span className="toolbar-inline-icon"><UndoIcon /></span>
            <span>Undo</span>
          </button>
          <button
            className="button toolbar-action-redo toolbar-top-btn"
            type="button"
            onClick={redo}
            disabled={!futureCount}
          >
            <span className="toolbar-inline-icon"><RedoIcon /></span>
            <span>Redo</span>
          </button>
          <button className="button primary toolbar-top-btn" type="button" onClick={saveTemplate} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            className="button toolbar-action-render toolbar-top-btn toolbar-render-inline"
            type="button"
            onClick={onOpenRender}
            disabled={!template.id}
          >
            <span className="toolbar-inline-icon"><RenderIcon /></span>
            <span>Render</span>
          </button>
        </div>
      </div>

      <div className="toolbar toolbar-actions">
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAssetUpload}
        />

        {layerQuickAddActions.map(({ type, title, label, Icon }) => (
          <button
            key={type}
            className="button toolbar-icon-btn"
            type="button"
            onClick={() => addLayer(type)}
            title={title}
          >
            <span className="toolbar-icon"><Icon /></span>
            <span className="toolbar-btn-label">{label}</span>
          </button>
        ))}
        <button
          className="button toolbar-icon-btn"
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          disabled={uploading}
          title="Görsel Yükle"
        >
          <span className="toolbar-icon"><ImageIcon /></span>
          <span className="toolbar-btn-label">{uploading ? 'Yükleniyor...' : 'Görsel'}</span>
        </button>

        <select
          className="button"
          value={matchedSize ? sizeValue : 'custom'}
          onChange={(event) => {
            if (event.target.value === 'custom') {
              return;
            }
            const selected = canvasSizes.find(
              (item) => item.label === event.target.value
            );
            if (selected) {
              setTemplateMeta({ width: selected.width, height: selected.height });
              setCustomWidth(selected.width);
              setCustomHeight(selected.height);
            }
          }}
        >
          {canvasSizes.map((size) => (
            <option key={size.label} value={size.label}>
              {size.label}
            </option>
          ))}
          <option value="custom">Özel</option>
        </select>

        <input
          className="button toolbar-size-input"
          type="number"
          min={100}
          value={customWidth}
          onChange={(event) => setCustomWidth(Number(event.target.value))}
        />
        <input
          className="button toolbar-size-input"
          type="number"
          min={100}
          value={customHeight}
          onChange={(event) => setCustomHeight(Number(event.target.value))}
        />
        <button
          className="button"
          type="button"
          onClick={() =>
            setTemplateMeta({
              width: Math.max(100, Number(customWidth || 1080)),
              height: Math.max(100, Number(customHeight || 1080)),
            })
          }
        >
          Boyutu Uygula
        </button>

        <label className="button toolbar-color-input">
          Arkaplan
          <input
            type="color"
            value={template.background || '#ffffff'}
            onChange={(event) =>
              setTemplateMeta({ background: event.target.value })
            }
          />
        </label>

        {selectedLayer?.type === 'image' && (
          <button
            className="button toolbar-bg-btn"
            type="button"
            onClick={() => makeImageBackground(selectedLayerId)}
            disabled={!selectedLayerId}
          >
            <span className="toolbar-inline-icon"><CoverIcon /></span>
            <span>Arka plan yap</span>
          </button>
        )}

        <button
          className="button primary toolbar-render-btn"
          type="button"
          onClick={onOpenRender}
          disabled={!template.id}
        >
          <span className="toolbar-inline-icon"><RenderIcon /></span>
          <span>Render</span>
        </button>
      </div>
      {error && <p style={{ color: '#fca5a5', marginTop: 8 }}>{error}</p>}
    </div>
  );
}
