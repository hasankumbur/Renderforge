import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from '../components/editor/Canvas.jsx';
import LayerPanel from '../components/editor/LayerPanel.jsx';
import PropertiesPanel from '../components/editor/PropertiesPanel.jsx';
import RenderModal from '../components/editor/RenderModal.jsx';
import Toolbar from '../components/editor/Toolbar.jsx';
import { api } from '../lib/api.js';
import { useEditorStore } from '../store/editorStore.js';

export default function Editor() {
  const { id } = useParams();
  const resetTemplate = useEditorStore((state) => state.resetTemplate);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const renderResult = useEditorStore((state) => state.renderResult);

  const [error, setError] = useState('');
  const [showRenderModal, setShowRenderModal] = useState(false);

  useEffect(() => {
    if (!id) {
      resetTemplate();
      return;
    }

    let mounted = true;

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
  }, [id, resetTemplate, setTemplate]);

  return (
    <section>
      <Toolbar onOpenRender={() => setShowRenderModal(true)} />
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

      {renderResult?.url && (
        <p>
          Son render:{' '}
          <a href={renderResult.url} target="_blank" rel="noreferrer">
            {renderResult.url}
          </a>
        </p>
      )}

      <div className="editor-layout">
        <LayerPanel />
        <Canvas />
        <PropertiesPanel />
      </div>

      {showRenderModal && <RenderModal onClose={() => setShowRenderModal(false)} />}
    </section>
  );
}
