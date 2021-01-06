import AppError from '../utils/appError.js'

//Error Handling Middleware
const globalErrorHandler = (err, req, res, next) => {	
	console.log(err)
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development')    	
	  return sendErrorDev(err, req, res);
	let error = {...err};
	error.message = err.message;
	error.errmsg = err.errmsg;
	error.name = err.name;
	  if(error.code === 11000)
	  	error = handleDuplicateFieldsDB(error);
      if(error.name === 'CastError') 
     error = handleCastErrorDB(error)      
 	 if(error.name === 'ValidationError')
 	 	error = handleValidationErrorDB(error);
     if(error.name === 'JsonWebTokenError')
     	error = handleJWTError();
     if(error.name === 'TokenExpiredError')
     	error = handleJWTExpiredError();
	    sendErrorProd(error, req, res);    	  
}
export default globalErrorHandler;

//Error in Dev mode
function sendErrorDev(err, req, res) {
	//API
	if(req.originalUrl.startsWith('/api'))      
	return res.status(err.statusCode).json({
					status: err.status,
					error: err,
					message: err.message,
					stack: err.stack
				});
    //Rendered Website
    res.status(err.statusCode).render('error', {
    	title: 'Something went wrong ⚠',
    	msg: err.message
    })
}

//Error in Prod mode
function sendErrorProd(err, req, res) {
	//API
	if(req.originalUrl.startsWith('/api')){
		//Operational, trusted error: send message to Client
	if(err.isOperational)		
	return res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});
	//Programming or other unknown error: don't provide error details
	// 1) Log Error
	//console.error('ERROR ☹', err);
	// 2) Send generic message
	return res.status(500).json({
		status: 'error',
		message: 'Something went very wrong!'
	})
	}   

	//Rendered Website
	if(err.isOperational)		
	return res.status(err.statusCode).render('error', {
    	title: 'Something went wrong ⚠',
    	msg: err.message
    })
	//Programming or other unknown error: don't provide error details
	// 1) Log Error
	console.error('ERROR ☹', err);
	// 2) Send generic message
	return res.status(err.statusCode).render('error', {
    	title: 'Something went wrong ⚠',
    	msg: 'Please try again later'
    })
}

function handleDuplicateFieldsDB(err) {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}, please use another value.`;
	return new AppError(message, 400);
}

function handleCastErrorDB(err) {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
}

function handleValidationErrorDB(err) {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
}

function handleJWTError() {
	return new AppError('Invalid token. Please log in again.', 401);
}

function handleJWTExpiredError() {
	return new AppError('Token is expired. Please login again', 401);
}