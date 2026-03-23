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

const router = express.Router();

router.get('/history', (req, res) => {
  const rows = listRenders({ templateId: req.query.templateId });
  return res.json({ success: true, data: rows });
});

router.post('/', async (req, res) => {
  const { templateId, outputType = 'image', format = 'png', overrides = {} } = req.body;

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

  if (outputType !== 'image') {
    return res.status(400).json({
      success: false,
      error: 'Bu asamada sadece image render destekleniyor',
      code: 'OUTPUT_TYPE_NOT_SUPPORTED',
    });
  }

  const renderId = nanoid(14);

  createRender({
    id: renderId,
    template_id: templateId,
    output_type: outputType,
    status: 'processing',
    input_data: JSON.stringify(overrides || {}),
    output_path: null,
    output_url: null,
    error_msg: null,
  });

  try {
    const { outputRelativePath } = await renderTemplateToImage({
      renderId,
      template,
      overrides,
      format,
    });

    const hostUrl = process.env.HOST_URL || `${req.protocol}://${req.get('host')}`;
    const outputUrl = `${hostUrl}${outputRelativePath}`;

    const updated = updateRender(renderId, {
      status: 'done',
      output_path: outputRelativePath,
      output_url: outputUrl,
      error_msg: null,
    });

    return res.json({
      success: true,
      renderId,
      url: outputUrl,
      outputType,
      templateId,
      createdAt: updated?.created_at ?? new Date().toISOString(),
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
