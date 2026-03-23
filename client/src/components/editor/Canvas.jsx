import { useMemo } from 'react';
import { useEditorStore } from '../../store/editorStore.js';

function LayerNode({ layer }) {
  const style = {
    position: 'absolute',
    left: layer.x || 0,
    top: layer.y || 0,
    width: layer.width || 160,
    height: layer.height || 80,
    opacity: layer.opacity ?? 1,
    zIndex: layer.zIndex || 0,
    overflow: 'hidden',
  };

  if (layer.type === 'text') {
    return (
      <div
        style={{
          ...style,
          color: layer.color || '#fff',
          fontSize: layer.fontSize || 32,
          fontFamily: layer.fontFamily || 'Inter',
          fontWeight: layer.fontWeight || 'normal',
          textAlign: layer.textAlign || 'left',
          whiteSpace: 'pre-wrap',
        }}
      >
        {layer.text || ''}
      </div>
    );
  }

  if (layer.type === 'image') {
    return (
      <img
        src={layer.src || ''}
        alt={layer.name || layer.id}
        style={{ ...style, objectFit: 'cover' }}
      />
    );
  }

  if (layer.type === 'circle') {
    return (
      <div
        style={{
          ...style,
          borderRadius: '9999px',
          background: layer.fill || '#2563eb',
          border: `${layer.strokeWidth || 0}px solid ${layer.stroke || 'transparent'}`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        background: layer.fill || '#2563eb',
        borderRadius: layer.cornerRadius || 0,
        border: `${layer.strokeWidth || 0}px solid ${layer.stroke || 'transparent'}`,
      }}
    />
  );
}

export default function Canvas() {
  const template = useEditorStore((state) => state.template);

  const sortedLayers = useMemo(
    () =>
      [...template.layers]
        .filter((layer) => !layer.hidden)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
    [template.layers]
  );

  return (
    <div className="panel canvas-stage">
      <div
        className="canvas-surface"
        style={{
          width: template.width,
          height: template.height,
          background: template.background,
        }}
      >
        {sortedLayers.map((layer) => (
          <LayerNode key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}
