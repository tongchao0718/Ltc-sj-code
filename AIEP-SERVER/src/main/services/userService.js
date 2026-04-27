import User from '../models/User.js';

// 模拟用户数据
let users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
];

const userService = {
  // 获取所有用户
  getUsers: async () => {
    // 实际项目中，这里应该从数据库获取数据
    return users;
  },

  // 根据ID获取用户
  getUserById: async (id) => {
    // 实际项目中，这里应该从数据库获取数据
    return users.find(user => user.id === id);
  },

  // 创建用户
  createUser: async (userData) => {
    // 实际项目中，这里应该将数据保存到数据库
    const newUser = {
      id: String(users.length + 1),
      ...userData
    };
    users.push(newUser);
    return newUser;
  },

  // 更新用户
  updateUser: async (id, userData) => {
    // 实际项目中，这里应该更新数据库中的数据
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }
    users[index] = { ...users[index], ...userData };
    return users[index];
  },

  // 删除用户
  deleteUser: async (id) => {
    // 实际项目中，这里应该从数据库删除数据
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }
    const deletedUser = users[index];
    users.splice(index, 1);
    return deletedUser;
  }
};

export default userService;