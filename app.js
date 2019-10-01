const express       = require("express"),
	  app           = express(),
	  bodyParser    = require("body-parser"),
      mongoose      = require("mongoose"),
	  passport      = require("passport"),
      Sechand    = require("./models/sechand"),
	  seedDB        = require("./seeds"),
	  Comment       = require("./models/comment"),
	  LocalStrategy = require("passport-local"),
	  User          = require("./models/user"),
	  methodOverride= require("method-override"),
	  flash         = require("connect-flash");


const commentRoutes    = require("./routes/comments"),
      sechandRoutes = require("./routes/sechands"),
      indexRoutes       = require("./routes/index");
	  
// seedDB();
app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

mongoose.connect(process.env.DATABASEURL);

console.log(process.env.DATABASEURL);

app.use(require("express-session")({
	secret: "my name is wang",
	resave: false,
	saveUninitialized: false
}))
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride("_method"));


app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})



//requiring routes
app.use(indexRoutes);
app.use("/sechands",sechandRoutes);
app.use("/sechands/:id/comments", commentRoutes);




app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("start");
})