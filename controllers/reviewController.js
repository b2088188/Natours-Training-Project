import Review from './../models/reviewModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {getOne, deleteOne, updateOne, createOne} from './handlerFactory.js'


export const getAllReviews = catchAsync(async function (req, res, next) {   
   let filter = {};
   if(req.params.tourId)
     filter = {tour: req.params.tourId};
   const reviews = await Review.find(filter);

   res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { 
           reviews
        }
   });   
})

// exports.getTour = catchAsync(async function (req, res, next) {
//        //Tour.findOne({_id: req.params.id})                     
//        const tour = await Review.findById(req.params.id);
//        if(!tour)
//           return next(new AppError('No tour found with that ID', 404))
//           res.status(200).json({
//               status: 'success',
//               data: {
//                  tour
//               }       
//          })
// })


export const setTourUserId = (req, res, next) => {
         //Allow nested route
   if(!req.body.tour)
      req.body.tour = req.params.tourId;
   if(!req.body.user)
      req.body.user = req.user._id;
   next();
}
export const createReview = createOne(Review);
 
// exports.updateTour = catchAsync(async function (req, res, next) {
//          const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//             //return new document
//             new: true,
//             runValidators:true
//          });
//           if(!tour)
//           return next(new AppError('No tour found with that ID', 404))
//        res.status(200).json({
//           status: 'success',
//            data: {
//               tour
//            }
//        })
// })

export const getReview = getOne(Review);
export const deleteReview = deleteOne(Review);
export const updateReview = updateOne(Review);

// exports.deleteTour = catchAsync(async function (req, res, next) {   
//        const tour = await Tour.findByIdAndDelete(req.params.id);
//         if(!tour)
//           return next(new AppError('No tour found with that ID', 404))
//        res.status(204).json({
//          status: 'success',
//          data: null
//        });
// })
