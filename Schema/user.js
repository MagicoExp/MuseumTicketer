const mongoose = require('mongoose');
const dotenv  = require('dotenv');
dotenv.config();
const MONGO_URL = process.env.mongo_url;
const connect = async() =>{
   try {
    await mongoose.connect(MONGO_URL);
   console.log('DB connected of user');
   
    
   } catch (error) {
    console.log("error connecting data cause of " + error);
    
   }
}
connect();

const Schema = new mongoose.Schema({
    username:String,
    name:String,
    email:String,
    phoneNumber:Number,
    password:String,
    

})

const collection = new mongoose.model('user',Schema);
module.exports = collection;