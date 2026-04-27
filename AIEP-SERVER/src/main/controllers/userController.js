import userService from '../services/userService.js';

const userController = {
  // 获取所有用户
  getUsers: async (req, res) => {
    try {
      const users = await userService.getUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 根据ID获取用户
  getUserById: async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ status: 'error', message: 'User not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // 创建用户
  createUser: async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  },

  // 更新用户
  updateUser: async (req, res) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) {
        res.status(404).json({ status: 'error', message: 'User not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  },

  // 删除用户
  deleteUser: async (req, res) => {
    try {
      const user = await userService.deleteUser(req.params.id);
      if (!user) {
        res.status(404).json({ status: 'error', message: 'User not found' });
        return;
      }
      res.status(200).json({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
};

export default userController;