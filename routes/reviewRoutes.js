const express = require('express');
                                                      //Get access to other params of router
const router = express.Router({mergeParams: true});
const {getAllReviews, getReview, createReview, deleteReview, updateReview, setTourUserId} = require('../controllers/reviewController');
const {protect, restrictTo} = require('../controllers/authController');
  

router.route('/')
	       .get(protect, getAllReviews)
	       .post(protect, restrictTo('user'), setTourUserId, createReview);

router.route('/:id').get(getReview)
                                 .delete(deleteReview)
                                .patch(updateReview);

// router.route('/:id')
// 	        .get(getTour)
// 	        .patch(updateTour)
// 	                                    // Only Admin and Lead-Guide can delete
// 	        .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)


module.exports = router;			        