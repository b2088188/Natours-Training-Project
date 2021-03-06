import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {getAll, getOne, deleteOne, updateOne} from './handlerFactory.js'

//Save Images in the Disk
// const multerStorage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'public/img/users');
// 	},
// 	filename: (req, file, cb) => {
// 		const ext = file.mimetype.split('/')[1];
// 		cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
// 	}
// })

//Save Images in the memory
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

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
	if(!req.file)
		return next();
	//Save filename to give next middleware
	req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
	await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`)
	next();
})

const filterObj = (obj, ...allowedFields) => {
	return Object.keys(obj).reduce((acc, cur) => {
      if(allowedFields.includes(cur))
      	return {...acc, [cur]: obj[cur]};
      return acc;
	}, {})
}

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
	if(req.file)
		filteredBody.photo = req.file.filename;
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

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const deleteUser = deleteOne(User);
export const updateUser = updateOne(User);

