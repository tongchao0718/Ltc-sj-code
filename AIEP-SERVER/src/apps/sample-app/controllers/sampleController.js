import sampleService from '../services/sampleService.js';

const sampleController = {
  // 获取所有示例
  getSamples: async (req, res) => {
    try {
      const samples = await sampleService.getSamples();
      res.status(200).json({ status: 'success', data: samples });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 根据ID获取示例
  getSampleById: async (req, res) => {
    try {
      const sample = await sampleService.getSampleById(req.params.id);
      if (!sample) {
        res.status(404).json({ status: 'error', message: 'Sample not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: sample });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 创建示例
  createSample: async (req, res) => {
    try {
      const sample = await sampleService.createSample(req.body);
      res.status(201).json({ status: 'success', data: sample });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  },

  // 更新示例
  updateSample: async (req, res) => {
    try {
      const sample = await sampleService.updateSample(req.params.id, req.body);
      if (!sample) {
        res.status(404).json({ status: 'error', message: 'Sample not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: sample });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  },

  // 删除示例
  deleteSample: async (req, res) => {
    try {
      const sample = await sampleService.deleteSample(req.params.id);
      if (!sample) {
        res.status(404).json({ status: 'error', message: 'Sample not found' });
        return;
      }
      res.status(200).json({ status: 'success', message: 'Sample deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
};

export default sampleController;