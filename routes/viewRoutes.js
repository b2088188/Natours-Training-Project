import express from 'express';
import {isLoggedIn, protect} from '../controllers/authController.js';
import {getOverview, getTour, getLoginForm, getAccount, getMyTours} from '../controllers/viewController.js';
import {createBookingCheckout} from '../controllers/bookingController.js';
const router = express.Router();

router.get('/', createBookingCheckout, isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);
export default router;