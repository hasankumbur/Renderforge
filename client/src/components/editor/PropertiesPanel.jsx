import { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore.js';

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
        <h3>Ozellikler</h3>
        <p>Duzenlemek icin bir layer secin.</p>
      </aside>
    );
  }

  return (
    <aside className="panel">
      <h3>Ozellikler</h3>

      <label className="field">
        <span>Layer adi</span>
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
        <label className="field">
          <span>Gorsel URL</span>
          <input
            value={selectedLayer.src || ''}
            onChange={(event) =>
              updateLayer(selectedLayer.id, { src: event.target.value })
            }
          />
        </label>
      )}

      {(selectedLayer.type === 'rect' || selectedLayer.type === 'circle') && (
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
      )}

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
          One getir
        </button>
        <button className="button" type="button" onClick={() => sendBackward(selectedLayer.id)}>
          Arkaya gonder
        </button>
      </div>
    </aside>
  );
}
