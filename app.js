if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const dbUrl = process.env.ATLASDB_URL;

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const app = express(); 

async function main(){
    await  mongoose.connect(dbUrl);
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

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error",()=>{
    console.log("Error in mongo session store");
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000*60*60*24*3,//for a duration of 3 days
        maxAge: 1000*60*60*24*3,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

//configuration for passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

/* app.get("/demo",async(req,res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student",
     });

    let newUser = await User.register(fakeUser,"helloworld");
    res.send(newUser);
}); */

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)


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