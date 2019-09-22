const middlewareObj = {},
	  Campground = require("../models/campground"),
	  Comment = require("../models/comment");

middlewareObj.checkCampOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err,foundCampground)=>{
			if(err){
				req.flash("error", "NOT FOUND")
				console.log("err")
				res.redirect("back")
			}
			else{	
				if(foundCampground.author.id.equals(req.user._id)){
						next();
				}
				else {
					req.flash("error", "You don't have permission to do that")
					res.redirect("back")
				}
			}
		})
	}
	else{
		req.flash("error", "You need to be logged in")
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req, res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err,foundComment)=>{
			if(err){
				console.log("err cCO")
				res.redirect("back")
			}
			else{	
				if(foundComment.author.id.equals(req.user._id)){
						next();
				}
				else {
					req.flash("error","Sorry, you don't have permission")
					res.redirect("back")
				}
			}
		})
	}
	else{
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please Login First!")
	res.redirect("/login");
}


module.exports = middlewareObj;

