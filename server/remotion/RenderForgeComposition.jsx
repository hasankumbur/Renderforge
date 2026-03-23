import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

function layerStyle(layer, animatedOpacity) {
  return {
    position: 'absolute',
    left: Number(layer.x || 0),
    top: Number(layer.y || 0),
    width: Number(layer.width || 0) || undefined,
    height: Number(layer.height || 0) || undefined,
    opacity: animatedOpacity,
    zIndex: Number(layer.zIndex || 0),
    transform: `rotate(${Number(layer.angle || 0)}deg)`,
    transformOrigin: 'top left',
    overflow: 'hidden',
  };
}

function TextLayer({ layer, opacity }) {
  return (
    <div
      style={{
        ...layerStyle(layer, opacity),
        color: layer.color || '#ffffff',
        fontSize: Number(layer.fontSize || 32),
        fontFamily: layer.fontFamily || 'Inter, Arial, sans-serif',
        fontWeight: layer.fontWeight || 'normal',
        fontStyle: layer.italic ? 'italic' : 'normal',
        textDecoration: layer.underline ? 'underline' : 'none',
        textAlign: layer.textAlign || 'left',
        whiteSpace: 'pre-wrap',
      }}
    >
      {layer.text || ''}
    </div>
  );
}

function ImageLayer({ layer, opacity }) {
  return (
    <img
      src={layer.src || ''}
      style={{
        ...layerStyle(layer, opacity),
        objectFit: 'cover',
      }}
    />
  );
}

function ShapeLayer({ layer, opacity }) {
  const isCircle = layer.type === 'circle';
  return (
    <div
      style={{
        ...layerStyle(layer, opacity),
        background: layer.fill || '#2563eb',
        border: `${Number(layer.strokeWidth || 0)}px solid ${layer.stroke || 'transparent'}`,
        borderRadius: isCircle ? '9999px' : `${Number(layer.cornerRadius || 0)}px`,
      }}
    />
  );
}

export const RenderForgeComposition = ({ schema }) => {
  const frame = useCurrentFrame();

  const orderedLayers = [...(schema?.layers || [])].sort(
    (a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0)
  );

  return (
    <AbsoluteFill style={{ backgroundColor: schema?.background || '#ffffff' }}>
      {orderedLayers.map((layer, index) => {
        if (layer.hidden) {
          return null;
        }

        const animatedOpacity = interpolate(
          frame,
          [index * 3, index * 3 + 8],
          [0, Number(layer.opacity ?? 1)],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        if (layer.type === 'text') {
          return <TextLayer key={layer.id} layer={layer} opacity={animatedOpacity} />;
        }

        if (layer.type === 'image') {
          return <ImageLayer key={layer.id} layer={layer} opacity={animatedOpacity} />;
        }

        return <ShapeLayer key={layer.id} layer={layer} opacity={animatedOpacity} />;
      })}
    </AbsoluteFill>
  );
};
