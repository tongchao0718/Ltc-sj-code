import express from 'express';
import protocolFullFlowController from '../controllers/protocolFullFlowController.js';

const router = express.Router();

/* M02 样本 */
router.get('/sample/list', protocolFullFlowController.listSamples);
router.post('/sample/preprocess', protocolFullFlowController.preprocessSample);
router.post('/sample/annotate', protocolFullFlowController.annotateSample);
router.post('/sample/create', protocolFullFlowController.createSample);
router.post('/sample/update', protocolFullFlowController.updateSample);
router.post('/sample/delete', protocolFullFlowController.deleteSample);

/* M03 规则 */
router.get('/rule/list', protocolFullFlowController.listRules);
router.post('/rule/publish', protocolFullFlowController.publishRule);
router.post('/rule/create', protocolFullFlowController.createRule);
router.post('/rule/update', protocolFullFlowController.updateRule);
router.post('/rule/delete', protocolFullFlowController.deleteRule);

/* M04 任务 */
router.get('/task/strategy/list', protocolFullFlowController.listStrategies);
router.post('/task/strategy/create', protocolFullFlowController.createStrategy);
router.post('/task/strategy/update', protocolFullFlowController.updateStrategy);
router.post('/task/strategy/delete', protocolFullFlowController.deleteStrategy);
router.get('/task/list', protocolFullFlowController.listTasks);
router.post('/task/generate', protocolFullFlowController.generateTask);

/* M05 核查执行（闭环） */
router.post('/check/run', protocolFullFlowController.checkRun);

/* M06 提取 */
router.post('/extract/run', protocolFullFlowController.extractRun);
router.get('/extract/list', protocolFullFlowController.listExtractObjects);

/* M07 解析 */
router.get('/parse/list', protocolFullFlowController.listParseResults);
router.post('/parse/run', protocolFullFlowController.runParse);

/* M08 校核 */
router.get('/verify/list', protocolFullFlowController.listVerifyResults);
router.post('/verify/run', protocolFullFlowController.runVerify);

/* M09 问题 */
router.post('/problem/create', protocolFullFlowController.createProblem);
router.get('/problem/list', protocolFullFlowController.listProblems);

/* M10 治理 */
router.post('/issue/govern', protocolFullFlowController.governIssue);
router.post('/govern/dispatch', protocolFullFlowController.governDispatch);
router.post('/govern/transition', protocolFullFlowController.governTransition);
router.get('/govern/ticket/list', protocolFullFlowController.listTickets);

/* M11 / M12 监控 */
router.get('/task-monitor/list', protocolFullFlowController.listTaskMonitor);
router.get('/result-monitor/overview', protocolFullFlowController.resultMonitorOverview);

/* M13 优化 */
router.post('/optimize/iterate', protocolFullFlowController.iterateOptimize);
router.get('/optimize/list', protocolFullFlowController.listOptimizeIterations);

/* M14 复核 */
router.post('/review/submit', protocolFullFlowController.reviewSubmit);
router.get('/review/list', protocolFullFlowController.listReviews);
router.get('/review/error-corpus', protocolFullFlowController.listErrorCorpus);

export default router;
