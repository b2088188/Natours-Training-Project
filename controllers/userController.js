const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
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

function getUser(req, res) {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	})
}
function createUser(req, res) {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	})
}
function updateUser(req, res) {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	})
}
function deleteUser(req, res) {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	})
}			      

exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;