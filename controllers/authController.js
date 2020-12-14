const {promisify} = require('util')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')



exports.signup = catchAsync(async (req, res, next) => {
	//Prevent anyone to register an admin
	const newUser = await User.create(req.body);
	createSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
	const {email, password} = req.body;
	//  1) Check if email and password exist
    if(!email || !password)
       return next(new AppError('Please provide email and password', 400));
	// 2) Check if user exists & password is correct
    const user = await User.findOne({email}).select('+password');
    //If user exist, check if the password is correct
    if(!user || !await user.correctPassword(password, user.password))
    	return next(new AppError('Incorrect email or password'), 401); //Unauthorized
	// 3) If ok, send token to Client
	createSendToken(user, 200, res);

})

function signToken(id) {
	return jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	})
}

exports.protect = catchAsync(async (req, res, next) => {
	 let token;
    // 1) Getting token and check if it's there
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    	token = req.headers.authorization.split(' ')[1];
    if(!token)
    	return next(new AppError('You are not logged in. Please log in to get access'), 401)
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)    
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser)
    	return next(new AppError('The user belonging to this token does no longer exist', 401))
    // 4) Check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat))
    	return next(new AppError('User recently changed password. Please login again', 401));
    // 5) Go to protected route
    req.user = currentUser;
    next();
})

exports.restrictTo = (...roles) => {
	//Inner Function Close Over roles
	return (req, res, next) => {
		                              //this come from protect middleware
      if(!roles.includes(req.user.role))
      	return next(new AppError('You do not have permission to perfom this action', 403))// Forbidden
      //If have permission, go to the delete Controller
      next();
	}
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email})
    if(!user)
    	return next(new AppError('There is no user with email', 404))
    // 2) Generate the ramdom reset token
    const resetToken = user.createPasswordResetToken();
    //Close validators
    await user.save({validateBeforeSave: false});
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\n 
    If you didn't forget your password, please ignore this email
    `;
    try {
     await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
    res.status(200).json({
    	status: 'success',
    	message: 'Token sent to email!'
    })
    }
    catch(err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({validateBeforeSave: false});
      return next(new AppError('There was an error sending the email, try again later', 500))
    }
   
})
exports.resetPassword = (req, res, next) => {

}

exports.updatePassword = catchAsync(async (req, res, next) => {	
	// 1) Get user from collection      //Information Come from protect middleware
   const user = await User.findById(req.user.id).select('+password'); 
	// 2) Check if POSTed current password is correct
    if(!await user.correctPassword(req.body.passwordCurrent, user.password))
    	return next(new AppError('Your current password is wrong', 401)); //Unauthorized
	// 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // Auto validate password and passwordConfirm, only works with Create and Save
    await user.save();
	// 4) Log user in, send JWT
	createSendToken(user, 201, res);
})

function createSendToken(user, statusCode, res) {
	const token = signToken(user._id);
	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		}
	})
}