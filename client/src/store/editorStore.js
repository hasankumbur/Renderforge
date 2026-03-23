import { create } from 'zustand';

const emptyTemplate = {
  id: null,
  name: 'Yeni Template',
  width: 1080,
  height: 1080,
  background: '#ffffff',
  layers: [],
};

function normalizeTemplate(payload) {
  const schema = payload?.schema || {};

  return {
    id: payload?.id || null,
    name: payload?.name || 'Yeni Template',
    width: payload?.width || schema.width || 1080,
    height: payload?.height || schema.height || 1080,
    background: schema.background || '#ffffff',
    layers: schema.layers || [],
  };
}

export const useEditorStore = create((set, get) => ({
  template: emptyTemplate,
  selectedLayerId: null,
  renderResult: null,

  resetTemplate() {
    set({ template: emptyTemplate, selectedLayerId: null, renderResult: null });
  },

  setTemplate(payload) {
    set({
      template: normalizeTemplate(payload),
      selectedLayerId: null,
    });
  },

  setTemplateMeta(meta) {
    set((state) => ({
      template: {
        ...state.template,
        ...meta,
      },
    }));
  },

  setSelectedLayerId(layerId) {
    set({ selectedLayerId: layerId });
  },

  addLayer(type) {
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

    const nextLayer = { ...base, ...(presets[type] || {}) };

    set((state) => ({
      template: {
        ...state.template,
        layers: [...state.template.layers, nextLayer],
      },
      selectedLayerId: nextLayer.id,
    }));
  },

  updateLayer(layerId, patch) {
    set((state) => ({
      template: {
        ...state.template,
        layers: state.template.layers.map((layer) =>
          layer.id === layerId ? { ...layer, ...patch } : layer
        ),
      },
    }));
  },

  removeLayer(layerId) {
    set((state) => ({
      template: {
        ...state.template,
        layers: state.template.layers.filter((layer) => layer.id !== layerId),
      },
      selectedLayerId:
        state.selectedLayerId === layerId ? null : state.selectedLayerId,
    }));
  },

  bringForward(layerId) {
    set((state) => ({
      template: {
        ...state.template,
        layers: state.template.layers.map((layer) =>
          layer.id === layerId
            ? { ...layer, zIndex: (layer.zIndex || 0) + 1 }
            : layer
        ),
      },
    }));
  },

  sendBackward(layerId) {
    set((state) => ({
      template: {
        ...state.template,
        layers: state.template.layers.map((layer) =>
          layer.id === layerId
            ? { ...layer, zIndex: Math.max(0, (layer.zIndex || 0) - 1) }
            : layer
        ),
      },
    }));
  },

  setRenderResult(result) {
    set({ renderResult: result });
  },
}));
