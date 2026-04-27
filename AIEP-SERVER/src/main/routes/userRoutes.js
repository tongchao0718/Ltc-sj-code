import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// 用户相关路由
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;