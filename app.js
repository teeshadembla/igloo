const express = require("express");
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/igloo";
const Listing=require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review =require("./models/review.js");


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

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

/* app.get("/testListing",async(req,res)=>{
    let sampleListing = new Listing({
        title:"My new villa",
        description: "By the beach",
        price: 1200,
        location: "Calangute,Goa",
        country: "India",
    });

    await sampleListing.save();
    console.log("Sample was saved");
    res.send("successful testing");
}) */

/*---------------------------------------------------------------------*/

//ALL CRUD OPERATIONS BEGIN HERE

//1.printing all of our data
app.get("/listings", wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})
)

//3.NEW ROUTE - creating a new listing
//CRUD equivalent - create operation
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//2.Show Route- to show data of an individual listing
//CRUD equivalent: read operation
app.get("/listings/:id" , wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
})
)

//4.CREATE ROUTE - creating a new listing
//CRUD equivalent - create operation
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    })
)

//5.EDIT ROUTE- edit existing listings
//CRUD equivalent - update operation
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})
)

//6.UPDATE ROUTE - to put the edited data into the database
//CRUD equivalent- update operation
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})
)

//DELETE ROUTE - to delete a specific listing
//CRUD equivalent - delete operation
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
)


//REVIEWS

//CREATE ROUTE- adding a review
//CRUD equivalent- create operation
app.post("/listings/:id/reviews",validateReview ,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
})
)

//DELETE REVIEW ROUTE
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

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