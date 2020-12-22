import express from'express'
import morgan from'morgan'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import cookieParser from 'cookie-parser';

import AppError from'./utils/appError.js'
import tourRouter from'./routes/tourRoutes.js'
import userRouter from'./routes/userRoutes.js'
import reviewRouter from'./routes/reviewRoutes.js'
import viewRouter from './routes/viewRoutes.js';
import globalErrorHandler from './controllers/errorController.js'

const app = express();

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// import cors from 'cors';
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }))

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

//Middlewares
if(process.env.NODE_ENV === 'development')
app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));



//Mounting
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	//Throw Error to Error Middleware
	next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
})

app.use(globalErrorHandler);

export default app;


