import mongoose from'mongoose'
//npm package to set env variables
import dotenv from'dotenv'



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
app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});


