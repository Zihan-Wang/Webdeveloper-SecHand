const express    = require("express"),
	  router     = express.Router(),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware");

router.get("/", (req,res) => {
	var noMatch = null;
	if(req.query.search) {
		 const regex = new RegExp(escapeRegex(req.query.search), 'gi');
				Campground.find({name: regex}, function(err, allCampgrounds){
				   if(err){
					   console.log(err);
				   } else {
					  if(allCampgrounds.length < 1) {
						  noMatch = "No campgrounds match that query, please try again.";
					  }
					  res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
				   }
				});
	}
	else {
		console.log(req.user);
		Campground.find({}, (err, allCampgrounds)=>{
			if(err){
				console.log("err");
			}
			else {
				res.render("campgrounds/index",{campgrounds: allCampgrounds});
			}
		})
	}
})
router.post("/", middleware.isLoggedIn, (req, res) => {
	const name = req.body.name
	const price = req.body.price
	const image = req.body.image
	const desc = req.body.description
	const author = {
		id: req.user._id,
		username: req.user.username
	}
	const newCampground = {name: name, price: price, image: image, description: desc, author: author}
	
	Campground.create(newCampground, (err, newlyCreated) => {
		if(err){
			console.log("err");
		}
		else{
			res.redirect("/campgrounds");
		}
	})
})

router.get("/new", middleware.isLoggedIn, (req,res) => {
	res.render("campgrounds/new");
})

router.get("/:id", (req,res)=>{
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err){
			console.log("err");
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
})

//edit
router.get("/:id/edit", middleware.checkCampOwnership, (req,res)=>{
	//login?
	Campground.findById(req.params.id, (err,foundCampground)=>{
		if(err){
			res.redirect("campgrounds/" + req.params.id)
		}
		res.render("campgrounds/edit", {campground: foundCampground})
	})
})

router.put("/:id", function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
		if(err){
			res.redirect("/campgrounds")
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})


//delete
router.delete("/:id", middleware.checkCampOwnership, (req,res)=>{
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err)
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds");
		}
	})
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;