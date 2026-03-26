import { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore.js';

const FONT_FAMILIES = ['Inter', 'Roboto', 'Playfair Display', 'Oswald', 'Montserrat'];

function NumberField({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="field field-inline">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

export default function PropertiesPanel() {
  const layers = useEditorStore((state) => state.template.layers);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId),
    [layers, selectedLayerId]
  );

  if (!selectedLayer) {
    return (
      <aside className="panel">
        <h3>Özellikler</h3>
        <p>Düzenlemek için bir layer seçin.</p>
      </aside>
    );
  }

  return (
    <aside className="panel">
      <h3>Özellikler</h3>

      <label className="field">
        <span>Layer adı</span>
        <input
          value={selectedLayer.name || ''}
          onChange={(event) =>
            updateLayer(selectedLayer.id, { name: event.target.value })
          }
        />
      </label>

      {selectedLayer.type === 'text' && (
        <>
          <label className="field">
            <span>Metin</span>
            <textarea
              value={selectedLayer.text || ''}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { text: event.target.value })
              }
            />
          </label>

          <NumberField
            label="Font boyutu"
            value={selectedLayer.fontSize || 32}
            onChange={(value) => updateLayer(selectedLayer.id, { fontSize: value })}
          />

          <label className="field">
            <span>Font ailesi</span>
            <select
              value={selectedLayer.fontFamily || 'Inter'}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { fontFamily: event.target.value })
              }
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Font ağırlığı</span>
            <select
              value={selectedLayer.fontWeight || 'normal'}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { fontWeight: event.target.value })
              }
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </label>

          <ToggleField
            label="Italic"
            checked={Boolean(selectedLayer.italic)}
            onChange={(event) =>
              updateLayer(selectedLayer.id, { italic: event.target.checked })
            }
          />

          <ToggleField
            label="Underline"
            checked={Boolean(selectedLayer.underline)}
            onChange={(event) =>
              updateLayer(selectedLayer.id, { underline: event.target.checked })
            }
          />

          <label className="field">
            <span>Text align</span>
            <select
              value={selectedLayer.textAlign || 'left'}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { textAlign: event.target.value })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label className="field">
            <span>Renk</span>
            <input
              type="color"
              value={selectedLayer.color || '#ffffff'}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { color: event.target.value })
              }
            />
          </label>
        </>
      )}

      {selectedLayer.type === 'image' && (
        <>
          <label className="field">
            <span>Görsel URL</span>
            <input
              value={selectedLayer.src || ''}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { src: event.target.value })
              }
            />
          </label>

          <ToggleField
            label="Oranı koru"
            checked={Boolean(selectedLayer.keepRatio)}
            onChange={(event) =>
              updateLayer(selectedLayer.id, { keepRatio: event.target.checked })
            }
          />
        </>
      )}

      {(selectedLayer.type === 'rect' || selectedLayer.type === 'circle') && (
        <>
          <label className="field">
            <span>Dolgu</span>
            <input
              type="color"
              value={selectedLayer.fill || '#2563eb'}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { fill: event.target.value })
              }
            />
          </label>

          <label className="field">
            <span>Kenarlık rengi</span>
            <input
              type="color"
              value={selectedLayer.stroke || '#000000'}
              onChange={(event) =>
                updateLayer(selectedLayer.id, { stroke: event.target.value })
              }
            />
          </label>

          <NumberField
            label="Kenarlık kalınlığı"
            value={selectedLayer.strokeWidth || 0}
            onChange={(value) => updateLayer(selectedLayer.id, { strokeWidth: value })}
          />
        </>
      )}

      <label className="field">
        <span>Opacity (%)</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((selectedLayer.opacity ?? 1) * 100)}
          onChange={(event) =>
            updateLayer(selectedLayer.id, {
              opacity: Number(event.target.value) / 100,
            })
          }
        />
      </label>

      <NumberField
        label="X"
        value={selectedLayer.x || 0}
        onChange={(value) => updateLayer(selectedLayer.id, { x: value })}
      />
      <NumberField
        label="Y"
        value={selectedLayer.y || 0}
        onChange={(value) => updateLayer(selectedLayer.id, { y: value })}
      />
      <NumberField
        label="Width"
        value={selectedLayer.width || 160}
        onChange={(value) => updateLayer(selectedLayer.id, { width: value })}
      />
      <NumberField
        label="Height"
        value={selectedLayer.height || 80}
        onChange={(value) => updateLayer(selectedLayer.id, { height: value })}
      />

      {selectedLayer.type === 'rect' && (
        <NumberField
          label="Corner radius"
          value={selectedLayer.cornerRadius || 0}
          onChange={(value) => updateLayer(selectedLayer.id, { cornerRadius: value })}
        />
      )}

      <ToggleField
        label="Variable aktif"
        checked={Boolean(selectedLayer.variable)}
        onChange={(event) =>
          updateLayer(selectedLayer.id, {
            variable: event.target.checked ? selectedLayer.variable || selectedLayer.name : '',
          })
        }
      />

      <label className="field">
        <span>Variable</span>
        <input
          placeholder="headerText"
          value={selectedLayer.variable || ''}
          onChange={(event) =>
            updateLayer(selectedLayer.id, { variable: event.target.value })
          }
        />
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="button" type="button" onClick={() => bringForward(selectedLayer.id)}>
          Öne getir
        </button>
        <button className="button" type="button" onClick={() => sendBackward(selectedLayer.id)}>
          Arkaya gönder
        </button>
      </div>
    </aside>
  );
}
