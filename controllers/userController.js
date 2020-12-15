const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const {getOne, deleteOne, updateOne} = require('./handlerFactory');
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

exports.getUser = getOne(User);
exports.deleteUser = deleteOne(User);
exports.updateUser = updateOne(User);

exports.createUser = createUser;
