const express    = require("express"),
	  router     = express.Router(),
	  Sechand = require("../models/sechand"),
	  middleware = require("../middleware"),
	  cloudinary = require('cloudinary'),
	  multer = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.no-+w() + file.originalname);
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
				Sechand.find({name: regex}, function(err, allSechands){
				   if(err){
					   console.log(err);
				   } else {
					  if(allSechands.length < 1) {
						  noMatch = "No secondhands match that query, please try again.";
					  }
					  res.render("sechands/index",{sechands:allSechands, noMatch: noMatch});
				   }
				});
	}
	else {
		console.log(req.user);
		Sechand.find({}, (err, allSechands)=>{
			if(err){
				console.log("err");
			}
			else {
				res.render("Sechands/index",{sechands: allSechands});
			}
		})
	}
})
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	 cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      req.body.sechand.image = result.secure_url;
      req.body.sechand.imageId = result.public_id;
      req.body.sechand.author = {
        id: req.user._id,
        username: req.user.username
      }
      Sechand.create(req.body.sechand, function(err, sechand) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/sechands/' + sechand.id);
      });
    });
})

router.get("/new", middleware.isLoggedIn, (req,res) => {
	res.render("sechands/new");
})

router.get("/:id", (req,res)=>{
	Sechand.findById(req.params.id).populate("comments").exec(function(err,foundSechand){
		if(err){
			console.log("err");
		}
		else{
			res.render("sechands/show", {sechand: foundSechand});
		}
	});
})

//edit
router.get("/:id/edit", middleware.checkSecOwnership, (req,res)=>{
	//login?
	Sechand.findById(req.params.id, (err,foundSechand)=>{
		if(err){
			res.redirect("sechands/" + req.params.id)
		}
		res.render("sechands/edit", {sechand: foundSechand})
	})
})

router.put("/:id", upload.single('image'), function(req, res){
	 Sechand.findById(req.params.id, async function(err, sechand){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(sechand.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  sechand.imageId = result.public_id;
                  sechand.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            sechand.name = req.body.name;
            sechand.description = req.body.description;
            sechand.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/sechands/" + sechand._id);
        }
    });
})


//delete
router.delete("/:id", middleware.checkEcOwnership, (req,res)=>{
	Sechand.findByIdAndRemove(req.params.id,  async function(err, sechand){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		try {
			await cloudinary.v2.uploader.destroy(sechand.imageId);
			sechand.remove();
			req.flash('success', 'Sechand deleted successfully!');
			res.redirect('/sechands');
		} catch(err) {
			  if(err) {
			  req.flash("error", err.message);
			  return res.redirect("back");
			  }
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