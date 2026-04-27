import express from 'express';
import sampleController from '../controllers/sampleController.js';

const router = express.Router();

// 示例相关路由
router.get('/', sampleController.getSamples);
router.get('/:id', sampleController.getSampleById);
router.post('/', sampleController.createSample);
router.put('/:id', sampleController.updateSample);
router.delete('/:id', sampleController.deleteSample);

export default router;