import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useEditorStore } from '../../store/editorStore.js';

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div>
      <div className="toolbar">
        <button className="button" type="button" onClick={() => addLayer('text')}>
          Text Ekle
        </button>
        <button className="button" type="button" onClick={() => addLayer('rect')}>
          Dikdortgen Ekle
        </button>
        <button className="button" type="button" onClick={() => addLayer('circle')}>
          Daire Ekle
        </button>
        <button className="button" type="button" onClick={() => addLayer('image')}>
          Gorsel Ekle
        </button>

        <select
          className="button"
          value={`${template.width}x${template.height}`}
          onChange={(event) => {
            const selected = canvasSizes.find(
              (item) => item.label === event.target.value
            );
            if (selected) {
              setTemplateMeta({ width: selected.width, height: selected.height });
            }
          }}
        >
          {canvasSizes.map((size) => (
            <option key={size.label} value={size.label}>
              {size.label}
            </option>
          ))}
        </select>

        <button className="button primary" type="button" onClick={saveTemplate} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button className="button" type="button" onClick={onOpenRender}>
          Render Al
        </button>
      </div>
      {error && <p style={{ color: '#fca5a5', marginTop: 8 }}>{error}</p>}
    </div>
  );
}
