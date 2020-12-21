import express from'express'
import morgan from'morgan'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import AppError from'./utils/appError.js'
import tourRouter from'./routes/tourRoutes.js'
import userRouter from'./routes/userRoutes.js'
import reviewRouter from'./routes/reviewRoutes.js'
import globalErrorHandler from './controllers/errorController.js'

const app = express();

app.set('view engine', 'pug');
app.set('views', )

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

export default app;


