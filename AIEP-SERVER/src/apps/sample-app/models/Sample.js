// 示例模型
// 实际项目中，这里应该使用Mongoose等ORM工具定义模型

class Sample {
  constructor(id, name, description, status) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export default Sample;