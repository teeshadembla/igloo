const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");



//ALL CRUD OPERATIONS BEGIN HERE

//1.printing all of our data
router.get("/", wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})
)

//3.NEW ROUTE - creating a new listing
//CRUD equivalent - create operation
router.get("/new",isLoggedIn, (req,res)=>{
    res.render("listings/new.ejs");
})

//2.Show Route- to show data of an individual listing
//CRUD equivalent: read operation
router.get("/:id" , wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews",populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
})
)

//4.CREATE ROUTE - creating a new listing
//CRUD equivalent - create operation
router.post("/",validateListing,wrapAsync(async(req,res,next)=>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    })
)

//5.EDIT ROUTE- edit existing listings
//CRUD equivalent - update operation
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
})
) 

//6.UPDATE ROUTE - to put the edited data into the database
//CRUD equivalent- update operation
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
})
)

//DELETE ROUTE - to delete a specific listing
//CRUD equivalent - delete operation
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
})
)

module.exports = router;

