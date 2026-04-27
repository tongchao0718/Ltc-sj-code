import Sample from '../models/Sample.js';

// 模拟示例数据
let samples = [
  { id: '1', name: 'Sample 1', description: 'This is sample 1', status: 'active' },
  { id: '2', name: 'Sample 2', description: 'This is sample 2', status: 'inactive' },
  { id: '3', name: 'Sample 3', description: 'This is sample 3', status: 'active' }
];

const sampleService = {
  // 获取所有示例
  getSamples: async () => {
    // 实际项目中，这里应该从数据库获取数据
    return samples;
  },

  // 根据ID获取示例
  getSampleById: async (id) => {
    // 实际项目中，这里应该从数据库获取数据
    return samples.find(sample => sample.id === id);
  },

  // 创建示例
  createSample: async (sampleData) => {
    // 实际项目中，这里应该将数据保存到数据库
    const newSample = {
      id: String(samples.length + 1),
      ...sampleData
    };
    samples.push(newSample);
    return newSample;
  },

  // 更新示例
  updateSample: async (id, sampleData) => {
    // 实际项目中，这里应该更新数据库中的数据
    const index = samples.findIndex(sample => sample.id === id);
    if (index === -1) {
      return null;
    }
    samples[index] = { ...samples[index], ...sampleData };
    return samples[index];
  },

  // 删除示例
  deleteSample: async (id) => {
    // 实际项目中，这里应该从数据库删除数据
    const index = samples.findIndex(sample => sample.id === id);
    if (index === -1) {
      return null;
    }
    const deletedSample = samples[index];
    samples.splice(index, 1);
    return deletedSample;
  }
};

export default sampleService;