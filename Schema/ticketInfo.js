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

    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }
}

);
// Schema.index({ email: 1, date: 1, time: 1 }, { unique: true });

const ticketInfo = new mongoose.model('ticketinfo',Schema);
module.exports = ticketInfo;