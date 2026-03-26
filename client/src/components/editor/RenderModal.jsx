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

  const [outputType, setOutputType] = useState('image');
  const [format, setFormat] = useState('png');
  const [fps, setFps] = useState(30);
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRender() {
    if (!template.id) {
      setError('Render almadan önce template kaydedilmeli.');
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
        outputType,
        format,
        fps,
        durationSeconds,
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
          <span>Çıktı tipi</span>
          <select
            value={outputType}
            onChange={(event) => {
              const nextType = event.target.value;
              setOutputType(nextType);
              setFormat(nextType === 'video' ? 'mp4' : 'png');
            }}
          >
            <option value="image">Görsel</option>
            <option value="video">Video</option>
          </select>
        </label>

        <label className="field">
          <span>Format</span>
          <select value={format} onChange={(event) => setFormat(event.target.value)}>
            {outputType === 'image' ? (
              <>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </>
            ) : (
              <>
                <option value="mp4">MP4</option>
                <option value="gif">GIF</option>
              </>
            )}
          </select>
        </label>

        {outputType === 'video' && (
          <>
            <label className="field">
              <span>FPS</span>
              <input
                type="number"
                min={10}
                max={60}
                value={fps}
                onChange={(event) => setFps(Number(event.target.value))}
              />
            </label>

            <label className="field">
              <span>Süre (saniye)</span>
              <input
                type="number"
                min={1}
                max={30}
                value={durationSeconds}
                onChange={(event) => setDurationSeconds(Number(event.target.value))}
              />
            </label>
          </>
        )}

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
            Vazgeç
          </button>
          <button className="button primary" type="button" onClick={handleRender} disabled={loading}>
            {loading ? 'İşleniyor...' : 'Render Al'}
          </button>
        </div>
      </div>
    </div>
  );
}
