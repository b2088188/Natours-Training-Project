const fs = require('fs');
const mongoose = require('mongoose');
//npm package to set env variables
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
dotenv.config({path: './config.env'});
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
}).then(con => console.log(con.connections))

//Start Server
const port = process.env.PORT || 3000;


//Read Json File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//Import Data Into Database
async function importData() {
	try {
       await Tour.create(tours);
       await User.create(users, {validateBeforeSave: false});
       await Review.create(reviews);
       console.log('Date successfully loaded!');
	}
	catch(err) {
       console.log(err);       
	}
       process.exit();
}

//Delete All Data from Collection
async function deleteData() {	
	try {
	await Tour.deleteMany();
	await User.deleteMany();
	await Review.deleteMany();
	console.log('Date successfully deleted!');
	}
	catch(err) {		
	}
	process.exit();
}

if(process.argv[2] === '--import')
	importData();
if(process.argv[2] === '--delete')
	deleteData();

console.log(process.argv);