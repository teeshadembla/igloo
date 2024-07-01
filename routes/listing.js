const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
  
const listingController = require("../controllers/listings.js");

//ALL CRUD OPERATIONS BEGIN HERE
//1.printing all of our data
//4.CREATE ROUTE - creating a new listing
//CRUD equivalent - create operation
router
.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,validateListing,wrapAsync(listingController.createListing));

//3.NEW ROUTE - creating a new listing
//CRUD equivalent - create operation
router.get("/new",isLoggedIn, listingController.renderNewForm);

//2.Show Route- to show data of an individual listing
//CRUD equivalent: read operation
//6.UPDATE ROUTE - to put the edited data into the database
//CRUD equivalent- update operation
//DELETE ROUTE - to delete a specific listing
//CRUD equivalent - delete operation
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));








//5.EDIT ROUTE- edit existing listings
//CRUD equivalent - update operation
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm)); 




module.exports = router;

