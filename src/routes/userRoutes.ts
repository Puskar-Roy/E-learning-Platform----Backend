import express, { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUsersCourseById,
} from '../controllers/userController';
import { protect, protectAdmin } from '../middleware/middleware';

const router: Router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:userId', protect, getUserById);
router.put('/:userId', protect, updateUserById);
router.get('/:userId/enrollments', protect, getUsersCourseById);
router.delete('/:userId', protectAdmin, deleteUserById);

export default router;
