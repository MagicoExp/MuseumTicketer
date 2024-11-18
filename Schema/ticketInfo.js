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
    name:String,
    email:String,
    date:String,
    time:String

})

const ticketInfo = new mongoose.model('ticketinfo',Schema);
module.exports = ticketInfo;