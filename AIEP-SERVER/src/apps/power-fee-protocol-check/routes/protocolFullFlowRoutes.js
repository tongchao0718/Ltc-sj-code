import express from 'express';
import protocolFullFlowController from '../controllers/protocolFullFlowController.js';

const router = express.Router();

router.post('/sample/annotate', protocolFullFlowController.annotateSample); // API-02
router.post('/rule/publish', protocolFullFlowController.publishRule); // API-03
router.post('/task/generate', protocolFullFlowController.generateTask); // API-04
router.post('/issue/govern', protocolFullFlowController.governIssue); // API-05
router.post('/optimize/iterate', protocolFullFlowController.iterateOptimize); // API-06
router.post('/parse/run', protocolFullFlowController.runParse); // API-07
router.post('/verify/run', protocolFullFlowController.runVerify); // API-08

export default router;
