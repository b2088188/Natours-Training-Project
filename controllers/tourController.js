import multer from 'multer';
import sharp from 'sharp';
import Tour from './../models/tourModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {getAll, getOne, createOne, deleteOne, updateOne} from './handlerFactory.js'

const multerStorage = multer.memoryStorage();


const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image'))
        return cb(null, true)
    cb(new AppError('Not an image, please upload only images', 400), false);
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});


export const uploadTourImages = upload.fields([
   {
    name: 'imageCover',
    maxCount: 1
   },
   {
    name: 'images',
    maxCount: 3
   }
])

export const resizeTourImages = catchAsync(async (req, res, next) => {
    if(!req.files)
        return next();
    if(!req.files.imageCover || !req.files.images)
        return next();
    // 1) Processing cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${req.body.imageCover}`)
    // 2) Processing Images
    req.body.images = [];
   await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
      await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/tours/${filename}`)
      req.body.images = [...req.body.images, filename];
    }));
    next();
})

export const aliasTopTours = (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
   next();
}



export const getAllTours = getAll(Tour);
//export const getAllTours = catchAsync(async function (req, res, next) {
    // Two ways to use query
   // 1) Basic query object
   // As soon as using await, the query will execute and come back with the
   // documents matched query.
   // const tours = await Tour.find({
   //  duration: 5,
   //  difficulty: 'easy'
   // })

   // 2) Special Mongoose methods
   // 1 - Build Query
   // 1A) Filtering
   // const queryObj = {...req.query};
   // const excludedFields = ['page', 'sort', 'limit', 'fields'];
   // excludedFields.forEach(el => delete queryObj[el])
   
   // 1B) Advanced Filtering
   // let queryStr = JSON.stringify(queryObj)
   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //return the $ + matched string

   //find return a query, so in Mongoose before using await
   //we can continue to use some methods to chain this query
   // let query = Tour.find(JSON.parse(queryStr));
   // 2) Sorting
   // if(req.query.sort)
   //    query = query.sort(req.query.sort.split(',').join(' '));
   // else
   //    query = query.sort('-createdAt'); //Default: Sort by Created Time
   // 3) Field Limiting
   // if(req.query.fields)
   //   query = query.select(req.query.fields.split(',').join(' ')); //Include only properties we want
   // else     
   //   query = query.select('-__v');   //Default: Exclude __v

  // 4) Pagination
  //Ex. page=2&limit=10, skip 10
    // const page = +req.query.page || 1;
    // const limit = +req.query.limit || 100;
    // const skip = (page - 1) * limit;
    // query.skip(skip).limit(limit); 
    // if(req.query.page){
    //   const numTours = await Tour.countDocuments(); //Return Number of documents
    //   if(skip > numTours)
    //      throw new Error('This page does not exist');
    // }
    
   // 2 - Execute Chained Query
   //query.sort().select().skip().limit()
   // const tours = await query;
   // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
   // 3 - Send Response
//    res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: { 
//            tours
//         }
//    });   
// })

export const getTour = getOne(Tour, {path: 'reviews'});
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);


//Aggregation Pipeline
export const getTourStats = catchAsync(async function (req, res, next) {
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

export const getMonthlyPlan = catchAsync(async function (req, res, next) {
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


