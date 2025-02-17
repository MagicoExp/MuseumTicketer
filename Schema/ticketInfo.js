const mongoose = require('mongoose');
const dotenv  = require('dotenv');
dotenv.config();
const MONGO_URL = process.env.mongo_url;
const connect = async() =>{
   try {
    await mongoose.connect(MONGO_URL);
   console.log('DB connected of TicketInfoo');
   
    
   } catch (error) {
    console.log("error connecting data cause of " + error);
    
   }
}
connect();

const Schema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, default:200 },
    numberOfTickets: { type: Number, default:2 },
    
},{timestamps:true}

);
// Schema.index({ email: 1, date: 1, time: 1 }, { unique: true });

const ticketInfo = new mongoose.model('ticketinfo',Schema);
module.exports = ticketInfo;