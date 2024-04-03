import express, { Router } from 'express';
import {
  addReview,
  updateReview,
  deleteReview,
  getAllReviewsForCourse,
} from '../controllers/reviewController';
import { protect } from '../middleware/middleware';

const router: Router = express.Router();

router.use(protect);
router.post('/reviews', addReview);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

export default router;
