const express    = require("express"),
	  router     = express.Router(),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware"),
	  cloudinary = require('cloudinary'),
	  multer = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.uploader.upload(req.file.path, function(result) {
		req.body.campground.image = result.secure_url;
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
		Campground.create(req.body.campground, function(err, campground) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/campgrounds/' + campground.id);
		});
	});
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

cloudinary.config({ 
  cloud_name: 'aa15171019', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = router;