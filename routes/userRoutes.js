const express = require('express')
const {getAllUsers, getUser, createUser, updateUser, deleteUser} = require('../controllers/userController');
const {signup, login, forgotPassword, protect, updatePassword} = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', forgotPassword);

router.patch('/updateMyPassword', protect, updatePassword)

router.route('/')
			        .get(getAllUsers)
			        .post(createUser)

router.route('/:id')       
			       .get(getUser)
			       .patch(updateUser) 
			       .delete(deleteUser)



module.exports = router;			      