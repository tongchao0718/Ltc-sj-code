// 用户模型
// 实际项目中，这里应该使用Mongoose等ORM工具定义模型

class User {
  constructor(id, name, email, role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export default User;