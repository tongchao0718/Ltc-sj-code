# Express 三层模板（参照 sample-app）

## routes/sampleRoutes.js

```javascript
import express from 'express';
import sampleController from '../controllers/sampleController.js';

const router = express.Router();
router.get('/', sampleController.getSamples);
router.get('/:id', sampleController.getSampleById);
export default router;
```

## controllers/sampleController.js

```javascript
import sampleService from '../services/sampleService.js';

export async function getSamples(req, res) {
  try {
    const data = await sampleService.list(req.query);
    res.json({ code: 0, message: 'success', data, requestId: '' });
  } catch (e) {
    res.status(500).json({ code: 50000, message: e.message, data: null, requestId: '' });
  }
}
```

## services/sampleService.js

```javascript
export async function list(query) {
  // TODO: 接 DB 或内存存储
  return { list: [], total: 0 };
}
```

## app.js 挂载

```javascript
import sampleRoutes from './src/apps/sample-app/routes/sampleRoutes.js';
app.use('/api/sample', sampleRoutes);
```
