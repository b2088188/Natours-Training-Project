import express from'express'
import morgan from'morgan'
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import AppError from'./utils/appError.js'
import tourRouter from'./routes/tourRoutes.js'
import userRouter from'./routes/userRoutes.js'
import reviewRouter from'./routes/reviewRoutes.js'
import globalErrorHandler from './controllers/errorController.js'

const app = express();

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

//Middlewares
if(process.env.NODE_ENV === 'development')
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));



//Mounting
app.get('/', (req, res, next) => {
  //Look for base pug to render
  res.status(200).render('base', {
  	//Passing variables: locals
  	tour: 'The Forest Hiker',
  	user: 'Shunze'
  });
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
	//Throw Error to Error Middleware
	next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
})

app.use(globalErrorHandler);

export default app;


