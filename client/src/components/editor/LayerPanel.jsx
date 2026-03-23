import { useEditorStore } from '../../store/editorStore.js';

export default function LayerPanel() {
  const layers = useEditorStore((state) => state.template.layers);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useEditorStore((state) => state.setSelectedLayerId);
  const removeLayer = useEditorStore((state) => state.removeLayer);
  const updateLayer = useEditorStore((state) => state.updateLayer);

  return (
    <aside className="panel">
      <h3>Layer Listesi</h3>
      {layers.length === 0 && <p>Henuz layer yok.</p>}
      {layers
        .slice()
        .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
        .map((layer) => (
          <div
            key={layer.id}
            className={
              selectedLayerId === layer.id ? 'layer-row selected' : 'layer-row'
            }
            onClick={() => setSelectedLayerId(layer.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setSelectedLayerId(layer.id);
              }
            }}
          >
            <div>
              <div>{layer.name}</div>
              <small>{layer.type}</small>
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
