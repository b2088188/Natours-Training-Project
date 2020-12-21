import User from '../models/userModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {getOne, deleteOne, updateOne} from './handlerFactory.js'

const filterObj = (obj, ...allowedFields) => {
	return Object.keys(obj).reduce((acc, cur) => {
      if(allowedFields.includes(cur))
      	return {...acc, [cur]: obj[cur]};
      return acc;
	}, {})
}

export const getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
    res.status(200).json({
    	status: 'success',
    	results: users.length,
    	data: {
    		users
    	}
    })
})


export const createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined, please use signup instead.'
	})
}

export const updateMe = catchAsync(async (req, res, next) => {
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

export const getMe = catchAsync(async (req, res, next) => {
   req.params.id = req.user._id;
   next();
});

export const getUser = getOne(User);
export const deleteUser = deleteOne(User);
export const updateUser = updateOne(User);

