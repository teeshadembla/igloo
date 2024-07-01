const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//sign in
router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async(req,res)=>{
    try{
        let {username, email, password} = req.body;
    const newUser = await new User({email,username});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to igloo!");
        res.redirect("/listings");
    })
    } catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}))

//login

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",saveRedirectUrl, passport.authenticate('local',{failureRedirect: '/login', failureFlash: true}) ,async(req,res)=>{
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
    req.flash("success","Welcome to igloo, you are logged in");
})

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are now logged out!");
        res.redirect("/listings");
    })
})


module.exports = router;