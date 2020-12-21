import express from 'express'
const router = express.Router();
import {getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan} from '../controllers/tourController.js'
import reviewRouter from '../routes/reviewRoutes.js'
import {protect, restrictTo} from '../controllers/authController.js'
//Params Middleware
//router.param('id', checkId)

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap')
            .get(aliasTopTours, getAllTours)

router.route('/tour-stats')
           .get(getTourStats)
router.route('/monthly-plan/:year')
           .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)           

router.route('/')
           //Protected Route MiddleWare
	       .get(getAllTours)
	       .post(protect, restrictTo('admin', 'lead-guide'), createTour)

router.route('/:id')
	        .get(getTour)
	        .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
	                                    // Only Admin and Lead-Guide can delete
	        .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

// router.route('/:tourId/reviews').post(protect, restrictTo('user'), createReview)

export default router;			        