const express = require("express");
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/igloo";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


const app = express();

async function main(){
    await  mongoose.connect(MONGO_URL );
}

main().then(()=>{
    console.log("conncection to DB");
}).catch((err)=>{
    console.log(err);
}); 

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("Hi! I am root");
})


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


/*---------------------------------------------------------------------*/

//MIDDLEWARES

app.all("*",(req,res,next)=>{
    return next(new ExpressError(404,"Page Not Found"))
})

app.use((err,req,res,next)=>{
    let { statusCode = 500, message = "Internal Server error"} = err;
    res.status(statusCode).render("error.ejs",{message});
    /* res.status(statusCode).send(message); */
})

app.listen(8080,()=>{
    console.log("server is listening on port 8080");
})