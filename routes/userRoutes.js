const express = require('express')
const {getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, getMe} = require('../controllers/userController');
const {signup, login, forgotPassword, protect, restrictTo, updatePassword} = require('../controllers/authController');
const router = express.Router();


//Public
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', forgotPassword);

//Private
router.use(protect);
router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
//Admin only
router.use(restrictTo('admin'));
router.route('/')
			        .get(getAllUsers)
			        .post(createUser)
router.route('/:id')       
			       .get(getUser)
			       .patch(updateUser) 
			       .delete(deleteUser)

module.exports = router;			      