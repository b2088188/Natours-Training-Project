import mongoose from 'mongoose'
import slugify from 'slugify'
//const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [20, 'A tour name must have less or equal than 10 characters'],
        minlength: [6, 'A tour name must have great or equal than 6 characters'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Ratings must be below 5.0'],
        //Run when there's a new value
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        required: [true, 'A tour must have a description'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a corver image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        selected: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    locations: [
    //Create document in tour document
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        //Establish reference to User
        ref: 'User'
      }
    ]    
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
   
//Virtual Populate
//Keeping a reference to all the child documents on parent documents.
//But without persisting that information to the database.
tourSchema.virtual('reviews', {
    ref: 'Review',
    //Reference to tour field of review model
    foreignField: 'tour',
    //What is store in tour field of review model: tour._id
    localField: '_id'
})

//Indexes: Optimize performance
//Should use on most search query
//tourSchema.index({price: 1});
//Compound Indexes: Optimize for querying price or ratingsAverage or both
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});

//Virtual Property
tourSchema.virtual('durationsWeeks').get(function() {
    //this point to the current document
    return this.duration / 7;
})

//Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    //Point to current document
    this.slug = slugify(this.name, { lower: true });
    next();
});

//*Embed user into tour document*
// tourSchema.pre('save', async function (next) {
//   //Results is an array of Promise
//   const guidesPromises = this.guides.map(id => User.findById(id))
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// })
//Run after all pre middleware finished
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// })

//Query Middleware
// tourSchema.pre('find', function (next) {
//   this.find({secretTour: {$ne: true}});
//   next();
// })
//                           Regex: Start with find
tourSchema.pre(/^find/, function(next) {
    //this point to current query
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
})

//Query middleware
tourSchema.pre(/^find/, function (next) {
  //fill up guides in model
  this.populate({
        path: 'guides',
        //Exclude property in output
        select: '-__v -passwordChangedAt'
    });
  next();
})
//Run after query executed
tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} ms`);
    console.log(docs);
    next();
})

//Aggregation Middleware
tourSchema.pre('aggregate', function(next) {
    //this point to current aggregation
    this.pipeline() = this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;