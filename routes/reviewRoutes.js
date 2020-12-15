const express = require('express');
//Get access to other params of router
const router = express.Router({ mergeParams: true });
const { getAllReviews, getReview, createReview, deleteReview, updateReview, setTourUserId } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

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


module.exports = router;