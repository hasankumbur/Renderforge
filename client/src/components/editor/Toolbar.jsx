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

const canvasSizes = [
  { label: '1080x1080', width: 1080, height: 1080 },
  { label: '1920x1080', width: 1920, height: 1080 },
  { label: '1080x1920', width: 1080, height: 1920 },
  { label: '1280x720', width: 1280, height: 720 },
];

export default function Toolbar({ onOpenRender }) {
  const template = useEditorStore((state) => state.template);
  const setTemplateMeta = useEditorStore((state) => state.setTemplateMeta);
  const addLayer = useEditorStore((state) => state.addLayer);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
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
      const payload = await api.uploadAsset(file);
      addLayer('image', {
        src: resolveAssetSrc(payload.data),
        width: 420,
        height: 240,
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
            className="button toolbar-action-undo"
            type="button"
            onClick={undo}
            disabled={!historyCount}
          >
            Undo
          </button>
          <button
            className="button toolbar-action-redo"
            type="button"
            onClick={redo}
            disabled={!futureCount}
          >
            Redo
          </button>
          <button className="button primary" type="button" onClick={saveTemplate} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            className="button toolbar-action-render"
            type="button"
            onClick={onOpenRender}
            disabled={!template.id}
          >
            Render
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

        <button className="button toolbar-icon-btn" type="button" onClick={() => addLayer('text')} title="Text Ekle">
          <span className="toolbar-icon">✏️</span>
          <span className="toolbar-btn-label">Text</span>
        </button>
        <button className="button toolbar-icon-btn" type="button" onClick={() => addLayer('rect')} title="Dikdörtgen Ekle">
          <span className="toolbar-icon">⬜</span>
          <span className="toolbar-btn-label">Dikdörtgen</span>
        </button>
        <button className="button toolbar-icon-btn" type="button" onClick={() => addLayer('circle')} title="Daire Ekle">
          <span className="toolbar-icon">⭕</span>
          <span className="toolbar-btn-label">Daire</span>
        </button>
        <button
          className="button toolbar-icon-btn"
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          disabled={uploading}
          title="Görsel Yükle"
        >
          <span className="toolbar-icon">🖼️</span>
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

        <button
          className="button primary toolbar-render-btn"
          type="button"
          onClick={onOpenRender}
          disabled={!template.id}
        >
          Render
        </button>
      </div>
      {error && <p style={{ color: '#fca5a5', marginTop: 8 }}>{error}</p>}
    </div>
  );
}
