import express from 'express';
import multer from 'multer';
import {getAllUsers, getUser, createUser, updateUser, deleteUser, updateMe, getMe, uploadUserPhoto, resizeUserPhoto} from '../controllers/userController.js'
import {signup, login, logout, forgotPassword, protect, restrictTo, updatePassword} from '../controllers/authController.js'



const router = express.Router();


//Public
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', forgotPassword);

//Private
router.use(protect);
router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
//Admin only
router.use(restrictTo('admin'));
router.route('/')
			        .get(getAllUsers)
			        .post(createUser)
router.route('/:id')       
			       .get(getUser)
			       .patch(updateUser) 
			       .delete(deleteUser)

export default router;			      