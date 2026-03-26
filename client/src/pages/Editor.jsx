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
    name: 'Facebook Gönderi',
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

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="m4 12.5 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  );
}

function PropertiesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h9" />
      <path d="M4 17h16" />
      <path d="M11 12h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="13" cy="17" r="2" />
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
  const selectedLayerId = useEditorStore((state) => state.selectedLayerId);
  const historyCount = useEditorStore((state) => state.history.length);
  const futureCount = useEditorStore((state) => state.future.length);
  const renderResult = useEditorStore((state) => state.renderResult);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const [error, setError] = useState('');
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [mobileSheet, setMobileSheet] = useState('none');

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 430) {
        setMobileSheet('none');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openMobileSheet = (name) => {
    setMobileSheet((prev) => (prev === name ? 'none' : name));
  };

  const sheetTitle =
    mobileSheet === 'layers'
      ? 'Katmanlar'
      : mobileSheet === 'properties'
        ? 'Özellikler'
        : 'Araçlar';

  return (
    <section className={mobileSheet !== 'none' ? 'editor-page mobile-sheet-open' : 'editor-page'}>
      <header className="editor-mobile-header">
        <button type="button" className="editor-mobile-header-btn" onClick={() => window.history.back()}>
          <BackIcon />
        </button>
        <div className="editor-mobile-header-title-wrap">
          <strong className="editor-mobile-header-title">{id ? 'Template Düzenle' : 'Yeni Tasarım'}</strong>
          <small className="editor-mobile-header-subtitle">Canva benzeri mobil çalışma alanı</small>
        </div>
        <button
          type="button"
          className="editor-mobile-header-btn"
          aria-label="Araçları aç"
          onClick={() => openMobileSheet('tools')}
        >
          <MoreIcon />
        </button>
      </header>

      <div className="editor-toolbar-desktop">
        <Toolbar onOpenRender={() => setShowRenderModal(true)} />
      </div>

      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

      {renderResult?.url && (
        <p className="render-result-link">
          Son render:{' '}
          <a href={renderResult.url} target="_blank" rel="noreferrer">
            {renderResult.url}
          </a>
        </p>
      )}

      <div className="editor-layout">
        <div className="editor-col editor-col-layers">
          <LayerPanel />
        </div>
        <div className="editor-col editor-col-canvas">
          <Canvas />
        </div>
        <div className="editor-col editor-col-properties">
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

      <div className="editor-mobile-dock" role="toolbar" aria-label="mobil editor aksiyonları">
        <button
          type="button"
          className={mobileSheet === 'tools' ? 'editor-mobile-dock-btn active' : 'editor-mobile-dock-btn'}
          onClick={() => openMobileSheet('tools')}
        >
          <AddIcon />
          <span>Ekle</span>
        </button>
        <button
          type="button"
          className={mobileSheet === 'layers' ? 'editor-mobile-dock-btn active' : 'editor-mobile-dock-btn'}
          onClick={() => openMobileSheet('layers')}
        >
          <LayersIcon />
          <span>Katmanlar</span>
        </button>
        <button
          type="button"
          className={mobileSheet === 'properties' ? 'editor-mobile-dock-btn active' : 'editor-mobile-dock-btn'}
          onClick={() => openMobileSheet('properties')}
          disabled={!selectedLayerId}
        >
          <PropertiesIcon />
          <span>Düzenle</span>
        </button>
        <button
          type="button"
          className="editor-mobile-dock-btn highlight"
          onClick={() => setShowRenderModal(true)}
          disabled={!templateId}
        >
          <RenderIcon />
          <span>Render</span>
        </button>
      </div>

      {mobileSheet !== 'none' && (
        <button
          type="button"
          className="editor-mobile-sheet-backdrop"
          onClick={() => setMobileSheet('none')}
          aria-label="paneli kapat"
        />
      )}

      <section
        className={mobileSheet !== 'none' ? 'editor-mobile-sheet open' : 'editor-mobile-sheet'}
        aria-hidden={mobileSheet === 'none'}
      >
        <button
          type="button"
          className="editor-mobile-sheet-handle"
          onClick={() => setMobileSheet('none')}
          aria-label="paneli kapat"
        >
          <span />
        </button>

        <div className="editor-mobile-sheet-tabs">
          <button
            type="button"
            className={mobileSheet === 'tools' ? 'button primary' : 'button'}
            onClick={() => setMobileSheet('tools')}
          >
            Araçlar
          </button>
          <button
            type="button"
            className={mobileSheet === 'layers' ? 'button primary' : 'button'}
            onClick={() => setMobileSheet('layers')}
          >
            Katmanlar
          </button>
          <button
            type="button"
            className={mobileSheet === 'properties' ? 'button primary' : 'button'}
            onClick={() => setMobileSheet('properties')}
            disabled={!selectedLayerId}
          >
            Özellikler
          </button>
        </div>

        <strong className="editor-mobile-sheet-title">{sheetTitle}</strong>

        <div className="editor-mobile-sheet-body">
          {mobileSheet === 'tools' && <Toolbar onOpenRender={() => setShowRenderModal(true)} />}
          {mobileSheet === 'layers' && <LayerPanel />}
          {mobileSheet === 'properties' && <PropertiesPanel />}
        </div>
      </section>

      {showRenderModal && <RenderModal onClose={() => setShowRenderModal(false)} />}
    </section>
  );
}
