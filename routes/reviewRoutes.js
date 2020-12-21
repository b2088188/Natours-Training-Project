import express from 'express'
//Get access to other params of router
const router = express.Router({ mergeParams: true });
import { getAllReviews, getReview, createReview, deleteReview, updateReview, setTourUserId } from '../controllers/reviewController.js'
import { protect, restrictTo } from '../controllers/authController.js'

router.use(protect);

router.route('/')
		    .get(getAllReviews)
		    .post(restrictTo('user'), setTourUserId, createReview);

router.route('/:id').get(getReview)
							    .patch(restrictTo('user', 'admin'), updateReview)
							    .delete(restrictTo('user', 'admin'), deleteReview);

// router.route('/:id')
// 	        .get(getTour)
// 	        .patch(updateTour)
// 	                                    // Only Admin and Lead-Guide can delete
// 	        .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)


export default router;