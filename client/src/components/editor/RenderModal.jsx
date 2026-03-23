import { useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { useEditorStore } from '../../store/editorStore.js';

export default function RenderModal({ onClose }) {
  const template = useEditorStore((state) => state.template);
  const setRenderResult = useEditorStore((state) => state.setRenderResult);

  const variables = useMemo(
    () => template.layers.filter((layer) => Boolean(layer.variable)),
    [template.layers]
  );

  const [format, setFormat] = useState('png');
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRender() {
    if (!template.id) {
      setError('Render almadan once template kaydedilmeli.');
      return;
    }

    setLoading(true);
    setError('');

    const overrides = {};
    variables.forEach((layer) => {
      overrides[layer.variable] = values[layer.variable] ?? (layer.type === 'text' ? layer.text : layer.src);
    });

    try {
      const result = await api.render({
        templateId: template.id,
        outputType: 'image',
        format,
        overrides,
      });

      setRenderResult(result);
      onClose();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Render Al</h3>

        <label className="field">
          <span>Format</span>
          <select value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </label>

        {variables.map((layer) => (
          <label key={layer.id} className="field">
            <span>{layer.variable}</span>
            <input
              value={values[layer.variable] || ''}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [layer.variable]: event.target.value,
                }))
              }
            />
          </label>
        ))}

        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="button" type="button" onClick={onClose}>
            Vazgec
          </button>
          <button className="button primary" type="button" onClick={handleRender} disabled={loading}>
            {loading ? 'Isleniyor...' : 'Render Al'}
          </button>
        </div>
      </div>
    </div>
  );
}
