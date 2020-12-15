const express = require('express');
                                                      //Get access to other params of router
const router = express.Router({mergeParams: true});
const {getAllReviews, createReview} = require('../controllers/reviewController');
const {protect, restrictTo} = require('../controllers/authController');
  

router.route('/')
	       .get(protect, getAllReviews)
	       .post(protect, restrictTo('user'), createReview);

// router.route('/:id')
// 	        .get(getTour)
// 	        .patch(updateTour)
// 	                                    // Only Admin and Lead-Guide can delete
// 	        .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)


module.exports = router;			        