import Stripe from 'stripe';
import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
console.log(process.env.STRIPE_SECRET_KEY)
const stripe = Stripe('sk_test_51I1RsJLbA09BGGD0D9Cbx52s8K7Ig5ZbWrc9gnc2ADmFotlgCqlw00FNuKiu52qDEyz8fTYK0nNJFSyRSkfXZ5Sv004VlPWpin');

export const getCheckoutSession = catchAsync(async (req, res, next) => {
	console.log(stripe)
   // 1) Get current booked tour
   const tour = await Tour.findById(req.params.tourId);
   // 2) Create checkout session
   const session = await stripe.checkout.sessions.create({
   	//Session Information
   	payment_method_types: ['card'],
   	success_url: `${req.protocol}://${req.get('host')}/`,
   	cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
   	customer_email: req.user.email,
   	client_reference_id: req.params.tourId,
   	//Product Information
   	line_items: [
      {
      	name: `${tour.name} Tour`,
      	description: tour.summary,
      	images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      	amount: tour.price * 100,
      	currency: 'usd',
      	quantity: 1
      }
   	]
   })
   // 3) Create session as response
   res.status(200).json({
   	status: 'success',
   	data: {
   		session
   	}
   })
})