import { useEffect, useRef, useState } from 'react';
import {
  Canvas as FabricCanvas,
  Circle,
  FabricImage,
  IText,
  Rect,
} from 'fabric';
import { useEditorStore } from '../../store/editorStore.js';

const GRID_SIZE = 10;
const MIN_FIT_SIZE = 80;
const MIN_USER_ZOOM = 1;
const MAX_USER_ZOOM = 4;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveLiveTemplate(templateRef, fallbackTemplate) {
  return templateRef.current || fallbackTemplate;
}

function getPreviewFrameSize(stage, template) {
  if (!stage) {
    return null;
  }

  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  const templateWidth = Math.max(1, Number(template.width || 1080));
  const templateHeight = Math.max(1, Number(template.height || 1080));

  if (!stageWidth || !stageHeight) {
    return null;
  }

  const horizontalPadding = 28;
  const verticalPadding = 28;
  const availableWidth = Math.max(MIN_FIT_SIZE, stageWidth - horizontalPadding);
  const availableHeight = Math.max(MIN_FIT_SIZE, stageHeight - verticalPadding);
  const aspectRatio = templateWidth / templateHeight;

  let frameWidth = availableWidth;
  let frameHeight = frameWidth / aspectRatio;

  if (frameHeight > availableHeight) {
    frameHeight = availableHeight;
    frameWidth = frameHeight * aspectRatio;
  }

  return {
    width: Math.max(MIN_FIT_SIZE, Math.round(frameWidth)),
    height: Math.max(MIN_FIT_SIZE, Math.round(frameHeight)),
  };
}

function getScreenToCanvasRatio(frame, template) {
  const templateWidth = Math.max(1, Number(template.width || 1080));
  const templateHeight = Math.max(1, Number(template.height || 1080));
  const frameWidth = Math.max(1, frame?.clientWidth || templateWidth);
  const frameHeight = Math.max(1, frame?.clientHeight || templateHeight);

  return {
    x: templateWidth / frameWidth,
    y: templateHeight / frameHeight,
  };
}

function applyViewport(canvas, template, viewport) {
  if (!canvas || !viewport) {
    return;
  }

  const templateWidth = Math.max(1, Number(template.width || 1080));
  const templateHeight = Math.max(1, Number(template.height || 1080));
  const zoom = clamp(viewport.zoom || 1, MIN_USER_ZOOM, MAX_USER_ZOOM);
  const scaledWidth = templateWidth * zoom;
  const scaledHeight = templateHeight * zoom;

  const minPanX = Math.min(0, templateWidth - scaledWidth);
  const minPanY = Math.min(0, templateHeight - scaledHeight);

  viewport.zoom = zoom;
  viewport.panX = zoom <= 1 ? 0 : clamp(viewport.panX || 0, minPanX, 0);
  viewport.panY = zoom <= 1 ? 0 : clamp(viewport.panY || 0, minPanY, 0);

  canvas.setViewportTransform([zoom, 0, 0, zoom, viewport.panX, viewport.panY]);
  canvas.calcOffset();
  canvas.requestRenderAll();
}

function fitCanvasToStage(canvas, stage, frame, template, viewport) {
  if (!canvas || !stage || !frame || !viewport) {
    return;
  }

  const frameSize = getPreviewFrameSize(stage, template);
  if (!frameSize) {
    return;
  }

  frame.style.width = `${frameSize.width}px`;
  frame.style.height = `${frameSize.height}px`;

  if (canvas.wrapperEl) {
    canvas.wrapperEl.style.width = `${frameSize.width}px`;
    canvas.wrapperEl.style.height = `${frameSize.height}px`;
  }

  if (canvas.lowerCanvasEl) {
    canvas.lowerCanvasEl.style.width = `${frameSize.width}px`;
    canvas.lowerCanvasEl.style.height = `${frameSize.height}px`;
  }

  if (canvas.upperCanvasEl) {
    canvas.upperCanvasEl.style.width = `${frameSize.width}px`;
    canvas.upperCanvasEl.style.height = `${frameSize.height}px`;
  }

  applyViewport(canvas, template, viewport);
}

async function createObjectFromLayer(layer) {
  const common = {
    left: Number(layer.x || 0),
    top: Number(layer.y || 0),
    originX: 'left',
    originY: 'top',
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

function getQuickActionsPosition(frame) {
  if (!frame) {
    return null;
  }

  const width = 196;
  return {
    left: Math.max(8, Math.round((frame.clientWidth - width) / 2)),
    top: 8,
    width,
  };
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

function FillCanvasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M4 9h16" />
      <path d="m7.5 15 2.4-2.3 2.1 1.9 2.1-2.1 2.4 2.5" />
    </svg>
  );
}

function BringFrontIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="9" width="10" height="9" rx="1.8" />
      <path d="M9 6h9v9" />
      <path d="m12 12 1.8-2 1.8 2" />
    </svg>
  );
}

function SendBackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="6" width="10" height="9" rx="1.8" />
      <path d="M5 9h9v9" />
      <path d="m12 12 1.8 2 1.8-2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="m9 4 .7 2h4.6l.7-2" />
      <path d="M7.5 7v11a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V7" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function AddElementIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function QuickActionButton({ onClick, title, danger = false, children }) {
  return (
    <button
      type="button"
      className={danger ? 'canvas-quick-action-btn danger' : 'canvas-quick-action-btn'}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <span className="canvas-quick-action-icon">{children}</span>
    </button>
  );
}

export default function Canvas() {
  const canvasElementRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const applyingRef = useRef(false);
  const templateRef = useRef(null);
  const sizeRef = useRef('');
  const viewportRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  const panRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: 1,
    startPanX: 0,
    startPanY: 0,
    startMidX: 0,
    startMidY: 0,
    ratioX: 1,
    ratioY: 1,
  });

  const template = useEditorStore((state) => state.template);
  templateRef.current = template;
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const setSelectedLayerId = useEditorStore((state) => state.setSelectedLayerId);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const removeLayer = useEditorStore((state) => state.removeLayer);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);
  const makeImageBackground = useEditorStore((state) => state.makeImageBackground);
  const selectedLayer = useEditorStore((state) =>
    state.template.layers.find((layer) => layer.id === state.selectedLayerId)
  );
  const [quickActions, setQuickActions] = useState(null);

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

    const getCurrentTemplate = () => resolveLiveTemplate(templateRef, template);

    const clearSelection = () => {
      setSelectedLayerId(null);
      setQuickActions(null);
    };

    const syncSelectionFromEvent = (event) => {
      const layerId = event.selected?.[0]?.data?.layerId || null;
      setSelectedLayerId(layerId);
      setQuickActions(layerId ? getQuickActionsPosition(frameRef.current) : null);
    };

    canvas.on('selection:created', syncSelectionFromEvent);
    canvas.on('selection:updated', syncSelectionFromEvent);
    canvas.on('selection:cleared', clearSelection);
    canvas.on('object:modified', (event) => syncFromFabricObject(event.target));
    canvas.on('text:changed', (event) => syncFromFabricObject(event.target));

    canvas.on('mouse:down', (event) => {
      if (event.target || pinchRef.current.active) {
        return;
      }

      const pointerEvent = event.e;
      panRef.current.active = true;
      panRef.current.lastX = pointerEvent.clientX ?? 0;
      panRef.current.lastY = pointerEvent.clientY ?? 0;
      canvas.defaultCursor = 'grab';
      canvas.discardActiveObject();
      clearSelection();
    });

    canvas.on('mouse:move', (event) => {
      if (!panRef.current.active || pinchRef.current.active) {
        return;
      }

      const frame = frameRef.current;
      if (!frame) {
        return;
      }

      const pointerEvent = event.e;
      const currentX = pointerEvent.clientX ?? 0;
      const currentY = pointerEvent.clientY ?? 0;
      const deltaX = currentX - panRef.current.lastX;
      const deltaY = currentY - panRef.current.lastY;
      const ratio = getScreenToCanvasRatio(frame, getCurrentTemplate());

      panRef.current.lastX = currentX;
      panRef.current.lastY = currentY;
      viewportRef.current.panX += deltaX * ratio.x;
      viewportRef.current.panY += deltaY * ratio.y;

      applyViewport(canvas, getCurrentTemplate(), viewportRef.current);
    });

    canvas.on('mouse:up', () => {
      panRef.current.active = false;
      canvas.defaultCursor = 'default';
    });

    canvas.on('mouse:wheel', (event) => {
      const delta = event.e.deltaY;
      const pointer = canvas.getPointer(event.e);
      const oldZoom = viewportRef.current.zoom || 1;
      const nextZoom = clamp(oldZoom * (0.999 ** delta), MIN_USER_ZOOM, MAX_USER_ZOOM);

      if (nextZoom !== oldZoom) {
        viewportRef.current.zoom = nextZoom;
        viewportRef.current.panX -= pointer.x * (nextZoom - oldZoom);
        viewportRef.current.panY -= pointer.y * (nextZoom - oldZoom);
        applyViewport(canvas, getCurrentTemplate(), viewportRef.current);
      }

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

      const nextSizeKey = `${Number(template.width || 1080)}x${Number(template.height || 1080)}`;
      if (sizeRef.current && sizeRef.current !== nextSizeKey) {
        viewportRef.current.zoom = 1;
        viewportRef.current.panX = 0;
        viewportRef.current.panY = 0;
      }
      sizeRef.current = nextSizeKey;

      canvas.requestRenderAll();
      fitCanvasToStage(
        canvas,
        stageRef.current,
        frameRef.current,
        template,
        viewportRef.current
      );
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
      setQuickActions(null);
      canvas.requestRenderAll();
      return;
    }

    const active = canvas
      .getObjects()
      .find((object) => object?.data?.layerId === selectedLayerId);
    if (active) {
      canvas.setActiveObject(active);
      setQuickActions(getQuickActionsPosition(frameRef.current));
      canvas.requestRenderAll();
    }
  }, [selectedLayerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!canvas || !stage || !frame) {
      return undefined;
    }

    const getCurrentTemplate = () => resolveLiveTemplate(templateRef, template);

    const handleResize = () => {
      fitCanvasToStage(canvas, stage, frame, getCurrentTemplate(), viewportRef.current);
    };

    const getDistance = (touches) => {
      const [a, b] = touches;
      return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    };

    const getMidpoint = (touches) => {
      const [a, b] = touches;
      return {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2,
      };
    };

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const midpoint = getMidpoint(event.touches);
        const ratio = getScreenToCanvasRatio(frame, getCurrentTemplate());

        pinchRef.current.active = true;
        pinchRef.current.startDistance = getDistance(event.touches);
        pinchRef.current.startZoom = viewportRef.current.zoom;
        pinchRef.current.startPanX = viewportRef.current.panX;
        pinchRef.current.startPanY = viewportRef.current.panY;
        pinchRef.current.startMidX = midpoint.x;
        pinchRef.current.startMidY = midpoint.y;
        pinchRef.current.ratioX = ratio.x;
        pinchRef.current.ratioY = ratio.y;

        panRef.current.active = false;
        return;
      }

      if (event.touches.length === 1) {
        const target = canvas.findTarget(event.touches[0]);
        if (target) {
          return;
        }

        panRef.current.active = true;
        panRef.current.lastX = event.touches[0].clientX;
        panRef.current.lastY = event.touches[0].clientY;
        canvas.discardActiveObject();
        setSelectedLayerId(null);
        setQuickActions(null);
      }
    };

    const handleTouchMove = (event) => {
      if (pinchRef.current.active && event.touches.length === 2) {
        event.preventDefault();

        const distance = getDistance(event.touches);
        const ratio = distance / Math.max(1, pinchRef.current.startDistance);
        const nextZoom = clamp(
          pinchRef.current.startZoom * ratio,
          MIN_USER_ZOOM,
          MAX_USER_ZOOM
        );
        const midpoint = getMidpoint(event.touches);
        const deltaX = (midpoint.x - pinchRef.current.startMidX) * pinchRef.current.ratioX;
        const deltaY = (midpoint.y - pinchRef.current.startMidY) * pinchRef.current.ratioY;

        viewportRef.current.zoom = nextZoom;
        viewportRef.current.panX = pinchRef.current.startPanX + deltaX;
        viewportRef.current.panY = pinchRef.current.startPanY + deltaY;

        applyViewport(canvas, getCurrentTemplate(), viewportRef.current);
        return;
      }

      if (panRef.current.active && event.touches.length === 1) {
        event.preventDefault();

        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const deltaX = currentX - panRef.current.lastX;
        const deltaY = currentY - panRef.current.lastY;
        const ratio = getScreenToCanvasRatio(frame, getCurrentTemplate());

        panRef.current.lastX = currentX;
        panRef.current.lastY = currentY;

        viewportRef.current.panX += deltaX * ratio.x;
        viewportRef.current.panY += deltaY * ratio.y;

        applyViewport(canvas, getCurrentTemplate(), viewportRef.current);
      }
    };

    const handleTouchEnd = () => {
      if (pinchRef.current.active) {
        pinchRef.current.active = false;
      }
      panRef.current.active = false;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    frame.addEventListener('touchstart', handleTouchStart, { passive: false });
    frame.addEventListener('touchmove', handleTouchMove, { passive: false });
    frame.addEventListener('touchend', handleTouchEnd);
    frame.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      frame.removeEventListener('touchstart', handleTouchStart);
      frame.removeEventListener('touchmove', handleTouchMove);
      frame.removeEventListener('touchend', handleTouchEnd);
      frame.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [template.height, template.width, setSelectedLayerId]);

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
          {quickActions && selectedLayerId && (
            <div
              className="canvas-quick-actions"
              style={{ left: quickActions.left, top: quickActions.top, width: quickActions.width }}
            >
              {selectedLayer?.type === 'image' && (
                <QuickActionButton
                  onClick={() => makeImageBackground(selectedLayerId)}
                  title="Arka plan yap"
                >
                  <FillCanvasIcon />
                </QuickActionButton>
              )}
              <QuickActionButton onClick={() => bringToFront(selectedLayerId)} title="En öne getir">
                <BringFrontIcon />
              </QuickActionButton>
              <QuickActionButton onClick={() => sendToBack(selectedLayerId)} title="En arkaya gönder">
                <SendBackIcon />
              </QuickActionButton>
              <QuickActionButton
                onClick={() => removeLayer(selectedLayerId)}
                title="Sil"
                danger
              >
                <TrashIcon />
              </QuickActionButton>
            </div>
          )}
          <div ref={frameRef} className="canvas-preview-frame">
            <canvas ref={canvasElementRef} className="fabric-canvas" />
            {template.layers.length === 0 && (
              <div className="canvas-empty-hint">
                <span className="canvas-empty-hint-icon"><AddElementIcon /></span>
                <p>Üstteki araç çubuğundan<br/>eleman ekleyin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
