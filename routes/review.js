const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review =require("../models/review.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware.js");

//REVIEWS

//CREATE ROUTE- adding a review
//CRUD equivalent- create operation

router.post("/",isLoggedIn,validateReview ,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
 
    await newReview.save();
    await listing.save();
    console.log("new review saved");
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
})
)

//DELETE REVIEW ROUTE
router.delete("/:reviewId",isLoggedIn, isReviewAuthor,  wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;