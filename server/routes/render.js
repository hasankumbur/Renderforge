import express from 'express';
import { nanoid } from 'nanoid';
import {
  createRender,
  getRenderById,
  getTemplateById,
  listRenders,
  updateRender,
} from '../db.js';
import { renderTemplateToImage } from '../services/imageRenderer.js';
import { renderQueue } from '../services/renderQueue.js';
import { renderTemplateToVideo } from '../services/videoRenderer.js';
import {
  normalizeVideoOptions,
  safeImageFormat,
  safeVideoFormat,
} from '../services/schemaUtils.js';

const router = express.Router();

router.get('/history', (req, res) => {
  const rows = listRenders({ templateId: req.query.templateId });
  return res.json({ success: true, data: rows });
});

router.post('/', async (req, res) => {
  const { templateId, outputType = 'image', format = 'png', overrides = {} } = req.body;
  const resolvedOutputType = String(outputType || 'image').toLowerCase();

  if (overrides && (typeof overrides !== 'object' || Array.isArray(overrides))) {
    return res.status(400).json({
      success: false,
      error: 'overrides alani key-value obje olmalidir',
      code: 'INVALID_OVERRIDES',
    });
  }

  if (!templateId) {
    return res.status(400).json({
      success: false,
      error: 'templateId zorunlu',
      code: 'TEMPLATE_ID_REQUIRED',
    });
  }

  const template = getTemplateById(templateId);
  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template bulunamadi',
      code: 'TEMPLATE_NOT_FOUND',
    });
  }

  if (!['image', 'video'].includes(resolvedOutputType)) {
    return res.status(400).json({
      success: false,
      error: 'outputType alani image veya video olmali',
      code: 'OUTPUT_TYPE_NOT_SUPPORTED',
    });
  }

  const safeFormat =
    resolvedOutputType === 'image' ? safeImageFormat(format) : safeVideoFormat(format);
  const videoOptions =
    resolvedOutputType === 'video'
      ? normalizeVideoOptions({
          fps: req.body.fps,
          durationSeconds: req.body.durationSeconds,
        })
      : null;

  const renderId = nanoid(14);
  const hostUrl = process.env.HOST_URL || `${req.protocol}://${req.get('host')}`;

  createRender({
    id: renderId,
    template_id: templateId,
    output_type: resolvedOutputType,
    status: 'pending',
    input_data: JSON.stringify({
      overrides: overrides || {},
      format: safeFormat,
      ...(videoOptions || {}),
    }),
    output_path: null,
    output_url: null,
    error_msg: null,
  });

  try {
    const queueTimeoutMs = resolvedOutputType === 'video' ? 20 * 60 * 1000 : 5 * 60 * 1000;

    const result = await renderQueue.enqueue(
      async () => {
        updateRender(renderId, {
          status: 'processing',
        });

        const renderOutput =
          resolvedOutputType === 'image'
            ? await renderTemplateToImage({
                renderId,
                template,
                overrides,
                format: safeFormat,
              })
            : await renderTemplateToVideo({
                renderId,
                template,
                overrides,
                format: safeFormat,
                fps: videoOptions.fps,
                durationSeconds: videoOptions.durationSeconds,
              });

        const outputUrl = `${hostUrl}${renderOutput.outputRelativePath}`;
        const updated = updateRender(renderId, {
          status: 'done',
          output_path: renderOutput.outputRelativePath,
          output_url: outputUrl,
          error_msg: null,
        });

        return {
          outputUrl,
          createdAt: updated?.created_at ?? new Date().toISOString(),
        };
      },
      { timeoutMs: queueTimeoutMs }
    );

    return res.json({
      success: true,
      renderId,
      url: result.outputUrl,
      outputType: resolvedOutputType,
      templateId,
      createdAt: result.createdAt,
    });
  } catch (error) {
    updateRender(renderId, {
      status: 'error',
      error_msg: error instanceof Error ? error.message : 'Bilinmeyen render hatasi',
    });

    return res.status(500).json({
      success: false,
      error: 'Render islemi basarisiz oldu',
      code: 'RENDER_FAILED',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get('/:id', (req, res) => {
  const row = getRenderById(req.params.id);
  if (!row) {
    return res.status(404).json({
      success: false,
      error: 'Render kaydi bulunamadi',
      code: 'RENDER_NOT_FOUND',
    });
  }

  return res.json({ success: true, data: row });
});

export default router;
