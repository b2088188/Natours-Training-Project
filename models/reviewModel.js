const mongoose = require('mongoose');

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


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;