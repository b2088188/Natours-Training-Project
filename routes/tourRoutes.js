const express = require('express');
const router = express.Router();
const {getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan} = require('../controllers/tourController');
const {protect, restrictTo} = require('../controllers/authController');
//Params Middleware
//router.param('id', checkId)

router.route('/top-5-cheap')
            .get(aliasTopTours, getAllTours)

router.route('/tour-stats')
           .get(getTourStats)
router.route('/monthly-plan/:year')
           .get(getMonthlyPlan)           

router.route('/')
           //Protected Route MiddleWare
	       .get(protect, getAllTours)
	       .post(createTour)

router.route('/:id')
	        .get(getTour)
	        .patch(updateTour)
	                                    // Only Admin and Lead-Guide can delete
	        .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)


module.exports = router;			        