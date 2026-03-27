import { create } from 'zustand';

const MAX_HISTORY = 80;

const emptyTemplate = {
  id: null,
  name: 'Yeni Template',
  width: 1080,
  height: 1080,
  background: '#ffffff',
  layers: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeLayerOrder(layers = []) {
  return [...layers]
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    .map((layer, index) => ({ ...layer, zIndex: index }));
}

function normalizeTemplate(payload) {
  const schema = payload?.schema || {};

  return {
    id: payload?.id || null,
    name: payload?.name || 'Yeni Template',
    width: payload?.width || schema.width || 1080,
    height: payload?.height || schema.height || 1080,
    background: schema.background || '#ffffff',
    layers: normalizeLayerOrder(schema.layers || []),
  };
}

function commitTemplateChange(state, nextTemplate, recordHistory) {
  if (!recordHistory) {
    return { template: nextTemplate };
  }

  return {
    template: nextTemplate,
    history: [...state.history, clone(state.template)].slice(-MAX_HISTORY),
    future: [],
  };
}

function applyTemplateMutation(state, mutateFn, recordHistory = true) {
  const nextTemplate = mutateFn(state.template);
  return commitTemplateChange(state, nextTemplate, recordHistory);
}

export const useEditorStore = create((set, get) => ({
  template: emptyTemplate,
  selectedLayerId: null,
  renderResult: null,
  history: [],
  future: [],

  resetTemplate() {
    set({
      template: emptyTemplate,
      selectedLayerId: null,
      renderResult: null,
      history: [],
      future: [],
    });
  },

  setTemplate(payload) {
    set({
      template: normalizeTemplate(payload),
      selectedLayerId: null,
      history: [],
      future: [],
    });
  },

  setTemplateMeta(meta, options = {}) {
    const recordHistory = options.recordHistory ?? true;
    set((state) =>
      applyTemplateMutation(
        state,
        (template) => ({
          ...template,
          ...meta,
        }),
        recordHistory
      )
    );
  },

  setSelectedLayerId(layerId) {
    set({ selectedLayerId: layerId });
  },

  addLayer(type, preset = {}) {
    const id = `layer_${Date.now()}`;
    const base = {
      id,
      name: `${type}_${Date.now().toString().slice(-4)}`,
      type,
      x: 40,
      y: 40,
      width: 320,
      height: 120,
      opacity: 1,
      zIndex: get().template.layers.length,
      variable: '',
    };

    const presets = {
      text: {
        text: 'Yeni metin',
        fontSize: 56,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#ffffff',
      },
      image: {
        src: '',
      },
      rect: {
        fill: '#2563eb',
      },
      circle: {
        fill: '#2563eb',
      },
    };

    const nextLayer = {
      ...base,
      ...(presets[type] || {}),
      ...preset,
    };

    set((state) => {
      const nextLayers = normalizeLayerOrder([...state.template.layers, nextLayer]);
      return {
        ...commitTemplateChange(
          state,
          {
            ...state.template,
            layers: nextLayers,
          },
          true
        ),
        selectedLayerId: nextLayer.id,
      };
    });
  },

  updateLayer(layerId, patch, options = {}) {
    const recordHistory = options.recordHistory ?? true;
    set((state) =>
      applyTemplateMutation(
        state,
        (template) => ({
          ...template,
          layers: template.layers.map((layer) =>
            layer.id === layerId ? { ...layer, ...patch } : layer
          ),
        }),
        recordHistory
      )
    );
  },

  removeLayer(layerId) {
    set((state) => {
      const nextLayers = normalizeLayerOrder(
        state.template.layers.filter((layer) => layer.id !== layerId)
      );
      return {
        ...commitTemplateChange(
          state,
          {
            ...state.template,
            layers: nextLayers,
          },
          true
        ),
        selectedLayerId: state.selectedLayerId === layerId ? null : state.selectedLayerId,
      };
    });
  },

  reorderLayers(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }

    set((state) => {
      const topFirst = [...state.template.layers].sort(
        (a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0)
      );
      const sourceIndex = topFirst.findIndex((item) => item.id === sourceId);
      const targetIndex = topFirst.findIndex((item) => item.id === targetId);

      if (sourceIndex < 0 || targetIndex < 0) {
        return {};
      }

      const [moved] = topFirst.splice(sourceIndex, 1);
      topFirst.splice(targetIndex, 0, moved);

      const nextLayers = topFirst
        .slice()
        .reverse()
        .map((layer, index) => ({ ...layer, zIndex: index }));

      return commitTemplateChange(
        state,
        {
          ...state.template,
          layers: nextLayers,
        },
        true
      );
    });
  },

  bringForward(layerId) {
    set((state) => {
      const layers = [...state.template.layers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
      );
      const index = layers.findIndex((layer) => layer.id === layerId);
      if (index < 0 || index === layers.length - 1) {
        return {};
      }

      const swap = layers[index + 1];
      layers[index + 1] = layers[index];
      layers[index] = swap;
      const nextLayers = normalizeLayerOrder(layers);

      return commitTemplateChange(
        state,
        {
          ...state.template,
          layers: nextLayers,
        },
        true
      );
    });
  },

  sendBackward(layerId) {
    set((state) => {
      const layers = [...state.template.layers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
      );
      const index = layers.findIndex((layer) => layer.id === layerId);
      if (index <= 0) {
        return {};
      }

      const swap = layers[index - 1];
      layers[index - 1] = layers[index];
      layers[index] = swap;
      const nextLayers = normalizeLayerOrder(layers);

      return commitTemplateChange(
        state,
        {
          ...state.template,
          layers: nextLayers,
        },
        true
      );
    });
  },

  bringToFront(layerId) {
    set((state) => {
      const layers = [...state.template.layers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
      );
      const index = layers.findIndex((layer) => layer.id === layerId);
      if (index < 0 || index === layers.length - 1) {
        return {};
      }

      const [layer] = layers.splice(index, 1);
      layers.push(layer);

      return commitTemplateChange(
        state,
        {
          ...state.template,
          layers: normalizeLayerOrder(layers),
        },
        true
      );
    });
  },

  sendToBack(layerId) {
    set((state) => {
      const layers = [...state.template.layers].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)
      );
      const index = layers.findIndex((layer) => layer.id === layerId);
      if (index <= 0) {
        return {};
      }

      const [layer] = layers.splice(index, 1);
      layers.unshift(layer);

      return commitTemplateChange(
        state,
        {
          ...state.template,
          layers: normalizeLayerOrder(layers),
        },
        true
      );
    });
  },

  makeImageBackground(layerId) {
    set((state) => {
      const target = state.template.layers.find(
        (layer) => layer.id === layerId && layer.type === 'image'
      );
      if (!target) {
        return {};
      }

      const templateWidth = Math.max(1, Number(state.template.width || 1080));
      const templateHeight = Math.max(1, Number(state.template.height || 1080));

      const updated = state.template.layers.map((layer) => {
        if (layer.id !== layerId) {
          return layer;
        }

        return {
          ...layer,
          x: 0,
          y: 0,
          width: templateWidth,
          height: templateHeight,
          zIndex: -1,
        };
      });

      return commitTemplateChange(
        state,
        {
          ...state.template,
          layers: normalizeLayerOrder(updated),
        },
        true
      );
    });
  },

  setRenderResult(result) {
    set({ renderResult: result });
  },

  undo() {
    set((state) => {
      if (!state.history.length) {
        return {};
      }

      const previous = state.history[state.history.length - 1];
      return {
        template: previous,
        history: state.history.slice(0, -1),
        future: [clone(state.template), ...state.future].slice(0, MAX_HISTORY),
        selectedLayerId: null,
      };
    });
  },

  redo() {
    set((state) => {
      if (!state.future.length) {
        return {};
      }

      const [next, ...rest] = state.future;
      return {
        template: next,
        history: [...state.history, clone(state.template)].slice(-MAX_HISTORY),
        future: rest,
        selectedLayerId: null,
      };
    });
  },
}));
