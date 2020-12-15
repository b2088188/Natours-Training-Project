const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {getOne, deleteOne, updateOne} = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
	return Object.keys(obj).reduce((acc, cur) => {
      if(allowedFields.includes(cur))
      	acc[cur] = obj[cur];
      return acc;
	}, {})
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
    res.status(200).json({
    	status: 'success',
    	results: users.length,
    	data: {
    		users
    	}
    })
})


function createUser(req, res) {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined, please use signup instead.'
	})
}

exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm)
    	return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
	// 2) Update user document
	//Not updating sensitive data like password, so we can use findByIdAndUpdate
	//Only allowing updating email and name
	let filteredBody = filterObj(req.body, 'name', 'email');
	let user = await User.findByIdAndUpdate(req.user._id, filteredBody, {new: true, runValidators: true});
    
	res.status(200).json({
		status: 'success',
		data: {
			user
		}
	})
})

exports.getUser = getOne(User);
exports.deleteUser = deleteOne(User);
exports.updateUser = updateOne(User);

exports.createUser = createUser;
