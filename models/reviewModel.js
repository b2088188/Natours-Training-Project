const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
	review: {
		type: String,
		required: [true, 'Review can not be empty']
	},
	rating: {
		type: Number,
		required: [true, 'Rating can not be empty'],
		min: [1, 'Rating must be above 1.0'],
        max: [5, 'Ratings must be below 5.0']
	},
	createdAt: {
        type: Date,
        default: Date.now(),
        selected: false
    },
    user: {
    	type: mongoose.Schema.ObjectId,
    	ref: 'User',
    	required: [true, 'Review must belong to a user']
    },
    tour: {
    	type: mongoose.Schema.ObjectId,
    	ref: 'Tour',
    	required: [true, 'Review must belong to a tour']
    }    
}, {
	toJSON: {virtuals: true},
	toObject: {virtual: true}
})
 
 //Compound Indexed, each combination of tour and user has to be unique
 //Prevent same user do twice review
reviewSchema.index({tour: 1, user: 1}, {unique: true});

//Query Middleware: Trigger when query starts with find*
reviewSchema.pre(/^find/, function (next) {
	// this.populate({
	// 	path: 'user',
	// 	select: 'name photo'
	// }).populate({
	// 	path: 'tour',
	// 	select: 'name'
	// })
		this.populate({
		path: 'user',
		select: 'name photo'
	})
	next();
})

//Statics methods: Need to call on a model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
	//this point to current model
	const stats = await this.aggregate([
       {
       	//Select all reviews match tourId
       	$match: {tour: tourId}
       },
       {
       	//Calculating for matched reviews
       	$group: {
       		_id: '$tour',
       		                //Add 1 for each document
       		nRating: {$sum: 1},
       		                   //Calculate total average
       		avgRating: {$avg: '$rating'}
       	}
       }
		]);
	//Save results of calculation to current tour
	if(stats.length > 0)
	await Tour.findByIdAndUpdate(tourId, {
		ratingsQuantity: stats[0].nRating,
		ratingsAverage: stats[0].avgRating
	})
}

//Run calculation after review document save/create to database
//Post middleware didn't have next argument
reviewSchema.post('save', function () {
	//this.constructor point to review model
	//this point to current review document
	this.constructor.calcAverageRatings(this.tour);
})

//findByIdAndUpdate
//findByIdAndDelete
//findOneAnd* trigger this query middleware
reviewSchema.pre(/^findOneAnd/, async function (next) {
	//this point to current query
	this.r = await this.findOne();//Executing query to get document
	next();
});

//Run after query finishing
reviewSchema.post(/^findOneAnd/, async function () {
	  //this doesn't work in post, because query has already executed
     // await this.findOne();

	//this.r is current review saving from pre query middleware
	//this.r.constructor point to review model
	await this.r.constructor.calcAverageRatings(this.r.tour);	
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;