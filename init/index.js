const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require('dotenv').config();

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
console.log(mapToken);
const geocodingClient = mbxGeocoding({ accessToken: "pk.eyJ1IjoidGVlc2hhZGVtYmxhIiwiYSI6ImNseTRjMGVmeTAwMWEyanM3a3RmMHd5aWQifQ.cOuRmEkY1WUrni8l2UDqng" });


async function main(){
    await  mongoose.connect("mongodb+srv://teeshadembla0507:ilkZrae58mE9ncWC@cluster0.urqkmdo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}

main().then(()=>{
    console.log("conncection to DB");
}).catch((err)=>{
    console.log(err);
}); 

const initDB = async()=>{

    const updatedData = await Promise.all(initData.data.map(async (entry) => {
        let response = await geocodingClient.forwardGeocode({
            query: entry.location,
            limit: 1,
          })
            .send();
          return {
            ...entry, owner: "6814e6109c9c013c1028c352", geometry: response.body.features[0].geometry|| { type: "Point", coordinates: [0, 0] }
          }
    }))
    
    await Listing.deleteMany({});
    await Listing.insertMany(updatedData);
    console.log("data was initialized");
}

initDB();