const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function aliasTopTours(req, res, next) {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
   next();
}

exports.getAllTours = catchAsync(async function (req, res, next) {
   
   //Build Query
   // 1A) Filtering
   const queryObj = {...req.query};
   const excludedFields = ['page', 'sort', 'limit', 'fields'];
   excludedFields.forEach(el => delete queryObj[el])
   
   // 1B) Advanced Filtering
   let queryStr = JSON.stringify(queryObj)
   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
   //find return a query, so we can continue to use methods to chain
   let query = Tour.find(JSON.parse(queryStr));
   // 2) Sorting
   if(req.query.sort)
      query = query.sort(req.query.sort.split(',').join(' '));
   else
      query = query.sort('-createdAt'); //Default: Sort by Created Time
   // 3) Field Limiting
   if(req.query.fields)
     query = query.select(req.query.fields.split(',').join(' ')); //Include only properties we want
   else     
     query = query.select('-__v');   //Default: Exclude __v

  // 4) Pagination
  //Ex. page=2&limit=10, skip 10
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit); 
    if(req.query.page){
      const numTours = await Tour.countDocuments(); //Return Number of documents
      if(skip > numTours)
         throw new Error('This page does not exist');
    }
    
   //Execute Query
   //query.sort().select().skip().limit()
   const tours = await query;
   // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
   //Send Response
   res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { 
           tours
        }
   });   
})

exports.getTour = catchAsync(async function (req, res, next) {
       //Tour.findOne({_id: req.params.id})                     
       const tour = await Tour.findById(req.params.id).populate('reviews');
       if(!tour)
          return next(new AppError('No tour found with that ID', 404))
          res.status(200).json({
              status: 'success',
              data: {
                 tour
              }       
         })
})



exports.createTour = catchAsync(async function (req, res, next) {   
const newTour = await Tour.create(req.body);
   res.status(201).json({
             status: 'success',
             data: {
                tour: newTour
             }
        });
})
 
exports.updateTour = catchAsync(async function (req, res, next) {
         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            //return new document
            new: true,
            runValidators:true
         });
          if(!tour)
          return next(new AppError('No tour found with that ID', 404))
       res.status(200).json({
          status: 'success',
           data: {
              tour
           }
       })
})

exports.deleteTour = catchAsync(async function (req, res, next) {   
       const tour = await Tour.findByIdAndDelete(req.params.id);
        if(!tour)
          return next(new AppError('No tour found with that ID', 404))
       res.status(204).json({
         status: 'success',
         data: null
       });
})

//Aggregation Pipeline
exports.getTourStats = catchAsync(async function (req, res, next) {
      //return aggregate object
     const stats = await Tour.aggregate([
     {      
       $match: {
         ratingsAverage: {$gte: 4.5}
       }
     },
     {
       $group: {
         //Group by each difficulty
         _id: '$difficulty',
         //Calc amount of documents
         numTours: {$sum: 1},
         numRatings: {$sum: '$ratingsQuantity'},
         //Calc average of total ratingsAverage
         avgRating: {$avg: '$ratingsAverage'},
         avgPrice: {$avg: '$price'},
         minPrice: {$min: '$price'},
         maxPrice: {$max: '$price'}
       }
     },     
     {
      $sort: {
         //Sort group by avgPrice
         avgPrice: 1
      }
     },

      ]);

     res.status(200).json({
         status: 'success',
        data: {
        stats
        }
       })
      res.status(400).json({
         status: 'fail',
         message: 'Invalid data sent!'
        })
})

exports.getMonthlyPlan = catchAsync(async function (req, res, next) {
     const year = +req.params.year;
     const plan = await Tour.aggregate([
       {
         $unwind: '$startDates'
       },
       {
         $match: {
            startDates: {
               //include the date between 1/1 - 12/31
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`)
            }
         }
       },
       {
         $group: {
            //Group by month
            _id: {
               $month: '$startDates'
            },
            numTourStarts: {
               $sum: 1
            },
            tours: {
               $push: '$name'
            }
         }
       },
       {
         $addFields: {
            $month: '$_id'
         }
       },
       {
         $project: {
            _id: 0
         }
       }
      ]);
     
     res.status(200).json({
         status: 'success',
        data: {
          plan
        }
       })
      res.status(404).json({
         status: 'fail',
         message: 'Invalid data sent!'
        })
})

exports.aliasTopTours = aliasTopTours;
