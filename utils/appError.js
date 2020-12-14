class AppError extends Error {
	contructor(message, statusCode){		
		this.message = message;
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startWith('4') ? 'fail' : 'error';
		this.isOperational = true;		
		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;