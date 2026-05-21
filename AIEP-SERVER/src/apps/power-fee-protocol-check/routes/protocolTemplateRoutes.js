import express from 'express';
import protocolTemplateController from '../controllers/protocolTemplateController.js';

const router = express.Router();

router.get('/list', protocolTemplateController.list);
router.get('/fields', protocolTemplateController.listFields);
router.get('/baseline/list', protocolTemplateController.listBaseline);
router.post('/create', protocolTemplateController.create);
router.post('/update', protocolTemplateController.update);
router.post('/delete', protocolTemplateController.remove);

export default router;
