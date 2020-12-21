import AppError from '../utils/appError.js'

//Error Handling Middleware
const globalErrorHandler = (err, req, res, next) => {	
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development')    	
	  return sendErrorDev(err, res);
	let error = {...err};
      if(error.name === 'CastError') 
     error = handleCastErrorDB(error)      
     if(error.name === 'JsonWebTokenError')
     	error = handleJWTError();
     if(error.name === 'TokenExpiredError')
     	error = handleJWTExpiredError();
	    sendErrorProd(error, res);    	  
}
export default globalErrorHandler;

//Error in Dev mode
function sendErrorDev(err, res) {
	res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack
		});
}

//Error in Prod mode
function sendErrorProd(err, res) {
	//Operational, trusted error: send message to Client
	if(err.isOperational)		
	res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});
	//Programming or other unknown error: don't provide error details
	// 1) Log Error
	console.error('ERROR ☹', err);
	// 2) Send generic message
	res.status(500).json({
		status: 'error',
		message: 'Something went very wrong!'
	})
}

function handleCastErrorDB(err) {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
}

function handleJWTError() {
	return new AppError('Invalid token. Please log in again.', 401);
}

function handleJWTExpiredError() {
	return new AppError('Token is expired. Please login again', 401);
}