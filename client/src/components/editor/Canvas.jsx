import { useEffect, useRef } from 'react';
import {
  Canvas as FabricCanvas,
  Circle,
  FabricImage,
  IText,
  Rect,
} from 'fabric';
import { useEditorStore } from '../../store/editorStore.js';

const GRID_SIZE = 10;
const MIN_FIT_ZOOM = 0.12;
const MAX_FIT_ZOOM = 1;

function fitCanvasToStage(canvas, stage, template) {
  if (!canvas || !stage) {
    return;
  }

  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  const templateWidth = Math.max(1, Number(template.width || 1080));
  const templateHeight = Math.max(1, Number(template.height || 1080));

  if (!stageWidth || !stageHeight) {
    return;
  }

  const horizontalPadding = 24;
  const verticalPadding = 24;
  const availableWidth = Math.max(60, stageWidth - horizontalPadding);
  const availableHeight = Math.max(60, stageHeight - verticalPadding);

  const fitZoom = Math.min(
    MAX_FIT_ZOOM,
    availableWidth / templateWidth,
    availableHeight / templateHeight
  );
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const maxMobileZoom = 0.52;
  const zoom = Math.max(MIN_FIT_ZOOM, isMobile ? Math.min(fitZoom, maxMobileZoom) : fitZoom);
  const scaledWidth = templateWidth * zoom;
  const scaledHeight = templateHeight * zoom;
  const offsetX = Math.max(0, (stageWidth - scaledWidth) / 2);
  const offsetY = Math.max(0, (stageHeight - scaledHeight) / 2);

  canvas.setViewportTransform([zoom, 0, 0, zoom, offsetX, offsetY]);
  canvas.renderAll();
}

async function createObjectFromLayer(layer) {
  const common = {
    left: Number(layer.x || 0),
    top: Number(layer.y || 0),
    angle: Number(layer.angle || 0),
    opacity: Number(layer.opacity ?? 1),
  };

  if (layer.type === 'text') {
    return new IText(layer.text || 'Metin', {
      ...common,
      width: Number(layer.width || 300),
      height: Number(layer.height || 100),
      fill: layer.color || '#ffffff',
      fontSize: Number(layer.fontSize || 56),
      fontFamily: layer.fontFamily || 'Inter',
      fontWeight: layer.fontWeight || 'normal',
      fontStyle: layer.italic ? 'italic' : 'normal',
      underline: Boolean(layer.underline),
      textAlign: layer.textAlign || 'left',
      editable: true,
    });
  }

  if (layer.type === 'image') {
    if (!layer.src) {
      return new Rect({
        ...common,
        width: Number(layer.width || 280),
        height: Number(layer.height || 180),
        fill: '#0b1220',
        stroke: '#334155',
        strokeDashArray: [8, 4],
      });
    }

    const image = await FabricImage.fromURL(layer.src, {
      crossOrigin: 'anonymous',
    });
    const baseWidth = image.width || 1;
    const baseHeight = image.height || 1;
    const targetWidth = Number(layer.width || baseWidth);
    const targetHeight = Number(layer.height || baseHeight);

    image.set({
      ...common,
      scaleX: targetWidth / baseWidth,
      scaleY: targetHeight / baseHeight,
    });
    return image;
  }

  if (layer.type === 'circle') {
    const radius = Math.max(4, Number(layer.width || 120) / 2);
    return new Circle({
      ...common,
      radius,
      fill: layer.fill || '#2563eb',
      stroke: layer.stroke || 'transparent',
      strokeWidth: Number(layer.strokeWidth || 0),
      scaleY: Number(layer.height || layer.width || 120) / (radius * 2),
    });
  }

  return new Rect({
    ...common,
    width: Number(layer.width || 260),
    height: Number(layer.height || 140),
    fill: layer.fill || '#2563eb',
    stroke: layer.stroke || 'transparent',
    strokeWidth: Number(layer.strokeWidth || 0),
    rx: Number(layer.cornerRadius || 0),
    ry: Number(layer.cornerRadius || 0),
  });
}

function objectToLayerPatch(object, layerType) {
  const width = Number((object.width || 1) * (object.scaleX || 1));
  const height = Number((object.height || 1) * (object.scaleY || 1));

  const patch = {
    x: Math.round(object.left || 0),
    y: Math.round(object.top || 0),
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
    opacity: Number((object.opacity ?? 1).toFixed(3)),
    angle: Math.round(object.angle || 0),
  };

  if (layerType === 'text') {
    patch.text = object.text ?? '';
    patch.fontSize = Number(object.fontSize || 56);
    patch.fontFamily = object.fontFamily || 'Inter';
    patch.fontWeight = object.fontWeight || 'normal';
    patch.italic = object.fontStyle === 'italic';
    patch.underline = Boolean(object.underline);
    patch.textAlign = object.textAlign || 'left';
    patch.color = object.fill || '#ffffff';
  }

  if (layerType === 'rect' || layerType === 'circle') {
    patch.fill = object.fill || '#2563eb';
    patch.stroke = object.stroke || 'transparent';
    patch.strokeWidth = Number(object.strokeWidth || 0);
  }

  if (layerType === 'rect') {
    patch.cornerRadius = Number(object.rx || 0);
  }

  return patch;
}

export default function Canvas() {
  const canvasElementRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const applyingRef = useRef(false);

  const template = useEditorStore((state) => state.template);
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useEditorStore((state) => state.setSelectedLayerId);
  const updateLayer = useEditorStore((state) => state.updateLayer);

  useEffect(() => {
    if (!canvasElementRef.current) {
      return undefined;
    }

    const canvas = new FabricCanvas(canvasElementRef.current, {
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;

    const syncFromFabricObject = (object) => {
      if (!object || applyingRef.current) {
        return;
      }

      const layerId = object?.data?.layerId;
      const layerType = object?.data?.layerType;
      if (!layerId || !layerType) {
        return;
      }

      updateLayer(layerId, objectToLayerPatch(object, layerType));
    };

    canvas.on('selection:created', (event) => {
      const object = event.selected?.[0];
      setSelectedLayerId(object?.data?.layerId || null);
    });
    canvas.on('selection:updated', (event) => {
      const object = event.selected?.[0];
      setSelectedLayerId(object?.data?.layerId || null);
    });
    canvas.on('selection:cleared', () => setSelectedLayerId(null));
    canvas.on('object:modified', (event) => syncFromFabricObject(event.target));
    canvas.on('text:changed', (event) => syncFromFabricObject(event.target));

    canvas.on('mouse:wheel', (event) => {
      const delta = event.e.deltaY;
      const point = canvas.getPointer(event.e);
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(3, Math.max(0.25, zoom));
      canvas.zoomToPoint(point, zoom);
      event.e.preventDefault();
      event.e.stopPropagation();
    });

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [setSelectedLayerId, updateLayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    let cancelled = false;

    async function drawScene() {
      applyingRef.current = true;
      canvas.clear();
      canvas.setDimensions({
        width: Number(template.width || 1080),
        height: Number(template.height || 1080),
      });
      canvas.backgroundColor = template.background || '#ffffff';

      const ordered = [...template.layers]
        .filter((layer) => !layer.hidden)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      for (const layer of ordered) {
        try {
          const object = await createObjectFromLayer(layer);
          if (!object || cancelled) {
            continue;
          }

          object.set({
            selectable: true,
            evented: true,
            data: {
              layerId: layer.id,
              layerType: layer.type,
            },
          });
          canvas.add(object);
        } catch (_error) {
          // Bozuk image URL gibi durumlarda layer atlanir.
        }
      }

      canvas.renderAll();
      fitCanvasToStage(canvas, stageRef.current, template);
      applyingRef.current = false;
    }

    drawScene();

    return () => {
      cancelled = true;
      applyingRef.current = false;
    };
  }, [template.background, template.height, template.layers, template.width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || applyingRef.current) {
      return;
    }

    if (!selectedLayerId) {
      canvas.discardActiveObject();
      canvas.renderAll();
      return;
    }

    const active = canvas
      .getObjects()
      .find((object) => object?.data?.layerId === selectedLayerId);
    if (active) {
      canvas.setActiveObject(active);
      canvas.renderAll();
    }
  }, [selectedLayerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) {
      return undefined;
    }

    const handleResize = () => {
      fitCanvasToStage(canvas, stage, template);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [template.height, template.width]);

  return (
    <div ref={stageRef} className="panel canvas-stage">
      <div className="canvas-scroll">
        <div
          className="canvas-board"
          style={{
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            backgroundImage:
              'linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
          }}
        >
          <canvas ref={canvasElementRef} className="fabric-canvas" />
          {template.layers.length === 0 && (
            <div className="canvas-empty-hint">
              <span>✚</span>
              <p>Üstteki araç çubuğundan<br/>eleman ekleyin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
