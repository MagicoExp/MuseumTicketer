const mongoose = require('mongoose');

const connect = async() =>{
   try {
    await mongoose.connect('mongodb+srv://name:Rohan1818@cluster0.phxe2.mongodb.net/Magico');
   console.log('DB connected');
   
    
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