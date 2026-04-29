import express from 'express';
import protocolTemplateController from '../controllers/protocolTemplateController.js';

const router = express.Router();

router.get('/list', protocolTemplateController.list);

export default router;
