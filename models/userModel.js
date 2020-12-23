import crypto from 'crypto'
import mongoose from 'mongoose'
import slugify from 'slugify'
import validator from 'validator'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please tell us your name']
	},
	email: {
		type: String,
		required: [true, 'Please provide your email'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	photo: {
		type: String,
		default: 'default.jpg'
	},
	role: {
       type: String,
       enum: ['user', 'guide', 'lead-guide', 'admin'],
       default: 'user'
	},
	password: {
		type: String,
		required: [true, 'Please provide password'],
		minlength: 8,
		//hidden in the output
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			// --This only works on "create" and "save"--
			validator: function (el) {
				//this point to current document
				return el === this.password;
			},
			message: 'Password are not the same'
		}
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date
})

//Run after getting the data, befor saving data
userSchema.pre('save', async function (next) {
	//this point to current document
	if(!this.isModified('password'))
		return next();	                               
    this.password = await bcrypt.hash(this.password, 12);//return a promise
    // Filter out property
    this.passwordConfirm = undefined;
    next();
})

//Instance method, available on all documents.
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
	let changedTimeStamp;
	if(this.passwordChangedAt)
		changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000);
    return JWTTimeStamp < changedTimeStamp;
	return false;
}
userSchema.methods.createPasswordResetToken = function () {
	// Reset Password
	const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 +1000; // 10 mins
    return resetToken;
}

const User = mongoose.model('User', userSchema);

export default User;