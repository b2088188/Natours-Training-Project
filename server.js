import mongoose from'mongoose'
//npm package to set env variables
import dotenv from'dotenv'

//Listenting Sync Exception
process.on('uncaughtException', err => {
	console.log('Uncaught Exception: Shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({path: './config.env'});
import app from './app.js';
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
}).then(con => console.log(con.connections))
console.log(process.env.NODE_ENV);
//Start Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});

//Listening Async Request Rejection
process.on('unhandledRejection', err => {
	console.log('Unhandled Rejection: Shutting down...');
	console.log(err.name, err.message);
	//After server close, close the application
	server.close(() => {		
	process.exit(1);
	})
})

