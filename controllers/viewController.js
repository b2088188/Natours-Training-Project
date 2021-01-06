import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';


export const getOverview =  catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template
  // 3) Render that template using tour data from (1),
  //and create HTML based on template, then send it to the Client
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({slug: req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  })
    if(!tour)
    return next(new AppError('There is no tour with that name', 404));
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour
  })
})

export const getLoginForm = (req, res) => {
    res.status(200).render('login', {
      title: 'Log into your account'
    })
}

export const getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find out bookings
  const bookings = await Booking.find({user: req.user._id})
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
                                                                //Select all tours which have an ID which is in the tourID array
  const tours = await Tour.find({_id: {$in: tourIDs}})
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  })
})

export const getAccount = (req, res) => {
  res.status(200).render('account', {
      title: 'Your account'
    })
}