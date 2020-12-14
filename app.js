const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHandler = require ('./controllers/errorController')

const app = express();

//Middlewares
if(process.env.NODE_ENV === 'development')
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`))



//Mounting
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	//Throw Error to Error Middleware
	next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
})

app.use(globalErrorHandler);

module.exports = app;


