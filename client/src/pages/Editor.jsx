import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Canvas from '../components/editor/Canvas.jsx';
import LayerPanel from '../components/editor/LayerPanel.jsx';
import PropertiesPanel from '../components/editor/PropertiesPanel.jsx';
import RenderModal from '../components/editor/RenderModal.jsx';
import Toolbar from '../components/editor/Toolbar.jsx';
import { api } from '../lib/api.js';
import { useEditorStore } from '../store/editorStore.js';

const editorPresets = {
  'instagram-post': {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
  },
  'instagram-story': {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
  },
  'facebook-post': {
    name: 'Facebook Gonderisi',
    width: 1080,
    height: 1080,
  },
  'tiktok-video': {
    name: 'TikTok Videosu',
    width: 1080,
    height: 1920,
  },
  'youtube-short': {
    name: 'YouTube Short',
    width: 1080,
    height: 1920,
  },
};

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 8H5v4" />
      <path d="M5 12c1.8-3 4.4-4.5 7.8-4.5A7.2 7.2 0 0 1 20 14.7" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 8h4v4" />
      <path d="M19 12c-1.8-3-4.4-4.5-7.8-4.5A7.2 7.2 0 0 0 4 14.7" />
    </svg>
  );
}

function RenderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Editor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetKey = searchParams.get('preset');
  const resetTemplate = useEditorStore((state) => state.resetTemplate);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const templateId = useEditorStore((state) => state.template.id);
  const historyCount = useEditorStore((state) => state.history.length);
  const futureCount = useEditorStore((state) => state.future.length);
  const renderResult = useEditorStore((state) => state.renderResult);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const [error, setError] = useState('');
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [mobileEditorTab, setMobileEditorTab] = useState('canvas');
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      const preset = presetKey ? editorPresets[presetKey] : null;
      resetTemplate();
      if (preset) {
        setTemplate({
          name: preset.name,
          width: preset.width,
          height: preset.height,
          schema: {
            background: '#ffffff',
            width: preset.width,
            height: preset.height,
            layers: [],
          },
        });
      }
      return;
    }

    let mounted = true;
    setError('');

    api
      .getTemplate(id)
      .then((payload) => {
        if (mounted) {
          setTemplate(payload.data);
        }
      })
      .catch((apiError) => {
        if (mounted) {
          setError(apiError.message);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, presetKey, resetTemplate, setTemplate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const targetTag = event.target?.tagName?.toLowerCase();
      const isTypingElement =
        targetTag === 'input' || targetTag === 'textarea' || event.target?.isContentEditable;
      if (isTypingElement) {
        return;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [redo, undo]);

  return (
    <section className="editor-page">
      <header className="editor-mobile-header">
        <button type="button" className="editor-mobile-header-btn" onClick={() => window.history.back()}>
          <BackIcon />
        </button>
        <div className="editor-mobile-header-title-wrap">
          <strong className="editor-mobile-header-title">Editor</strong>
          <small className="editor-mobile-header-subtitle">Mobil duzenleme</small>
        </div>
        <button type="button" className="editor-mobile-header-btn" aria-label="diger aksiyonlar">
          <MoreIcon />
        </button>
      </header>

      <Toolbar onOpenRender={() => setShowRenderModal(true)} />
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

      {renderResult?.url && (
        <p className="render-result-link">
          Son render:{' '}
          <a href={renderResult.url} target="_blank" rel="noreferrer">
            {renderResult.url}
          </a>
        </p>
      )}

      <div className="editor-mobile-tabs panel">
        <button
          type="button"
          className={mobileEditorTab === 'layers' ? 'button primary' : 'button'}
          onClick={() => {
            setMobileToolsOpen(false);
            setMobileEditorTab('layers');
          }}
        >
          Layers
        </button>
        <button
          type="button"
          className={mobileEditorTab === 'canvas' ? 'button primary' : 'button'}
          onClick={() => {
            setMobileToolsOpen(false);
            setMobileEditorTab('canvas');
          }}
        >
          Canvas
        </button>
        <button
          type="button"
          className={mobileToolsOpen ? 'button primary' : 'button'}
          onClick={() => {
            setMobileEditorTab('props');
            setMobileToolsOpen((prev) => !prev);
          }}
        >
          Araclar
        </button>
      </div>

      <div className="editor-layout">
        <div className={mobileEditorTab === 'layers' ? 'editor-col active' : 'editor-col'}>
          <LayerPanel />
        </div>
        <div className={mobileEditorTab === 'canvas' ? 'editor-col active' : 'editor-col'}>
          <Canvas />
        </div>
        <div
          className={
            mobileToolsOpen || mobileEditorTab === 'props'
              ? 'editor-col tools-drawer active'
              : 'editor-col tools-drawer'
          }
        >
          <PropertiesPanel />
        </div>
      </div>

      <div className="editor-floating-actions">
        <button
          type="button"
          className="editor-floating-btn"
          onClick={undo}
          disabled={!historyCount}
          aria-label="undo"
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          className="editor-floating-btn"
          onClick={redo}
          disabled={!futureCount}
          aria-label="redo"
        >
          <RedoIcon />
        </button>
        <button
          type="button"
          className="editor-floating-btn"
          onClick={() => setShowRenderModal(true)}
          disabled={!templateId}
          aria-label="render"
        >
          <RenderIcon />
        </button>
      </div>

      {showRenderModal && <RenderModal onClose={() => setShowRenderModal(false)} />}
    </section>
  );
}
