import express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
    getCheckoutSession,
    createBooking,
    getBooking,
    updateBooking,
    deleteBooking
} from '../controllers/bookingController.js';
const router = express.Router();

router.use(protect)
router.get('/checkout-session/:tourId', getCheckoutSession)


router.use(restrictTo('admin', 'lead-guide'))
router.route('/')
           
            .post(createBooking)
router.route('/:id')            
		    .get(getBooking)
		    .patch(updateBooking)
		    .delete(deleteBooking)
 //.get(getAllBookings)
export default router;