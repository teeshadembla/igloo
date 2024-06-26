const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/igloo";

async function main(){
    await  mongoose.connect(MONGO_URL );
}

main().then(()=>{
    console.log("conncection to DB");
}).catch((err)=>{
    console.log(err);
}); 

const initDB = async()=>{
    await Listing.deleteMany({});
    console.log(initData.data);
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();