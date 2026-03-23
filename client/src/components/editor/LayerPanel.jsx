import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore.js';

export default function LayerPanel() {
  const [draggingLayerId, setDraggingLayerId] = useState(null);

  const layers = useEditorStore((state) => state.template.layers);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useEditorStore((state) => state.setSelectedLayerId);
  const removeLayer = useEditorStore((state) => state.removeLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const reorderLayers = useEditorStore((state) => state.reorderLayers);

  const topFirstLayers = layers
    .slice()
    .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  return (
    <aside className="panel">
      <h3>Layer Listesi</h3>
      {layers.length === 0 && <p>Henuz layer yok.</p>}
      {topFirstLayers.map((layer) => (
          <div
            key={layer.id}
            className={
              selectedLayerId === layer.id ? 'layer-row selected' : 'layer-row'
            }
            draggable
            onDragStart={() => setDraggingLayerId(layer.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              reorderLayers(draggingLayerId, layer.id);
              setDraggingLayerId(null);
            }}
            onDragEnd={() => setDraggingLayerId(null)}
            onClick={() => setSelectedLayerId(layer.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setSelectedLayerId(layer.id);
              }
            }}
          >
            <div className="layer-main">
              <div>{layer.name}</div>
              <small>
                {layer.type} · z:{layer.zIndex ?? 0}
              </small>
              <label className="layer-variable-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(layer.variable)}
                  onChange={(event) => {
                    event.stopPropagation();
                    updateLayer(layer.id, {
                      variable: event.target.checked
                        ? layer.variable || layer.name
                        : '',
                    });
                  }}
                />
                Variable
              </label>
              {Boolean(layer.variable) && (
                <input
                  className="layer-variable-input"
                  value={layer.variable}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) =>
                    updateLayer(layer.id, { variable: event.target.value })
                  }
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="button"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updateLayer(layer.id, { hidden: !layer.hidden });
                }}
              >
                {layer.hidden ? 'Goster' : 'Gizle'}
              </button>
              <button
                className="button"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeLayer(layer.id);
                }}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
    </aside>
  );
}
