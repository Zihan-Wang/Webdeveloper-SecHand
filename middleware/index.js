const middlewareObj = {},
	  Sechand = require("../models/sechand"),
	  Comment = require("../models/comment");
middlewareObj.checkSecOwnership = function(req,res,next){
	if(req.isAuthenticated()){
		Sechand.findById(req.params.id, (err,foundSechand)=>{
			if(err){
				req.flash("error", "NOT FOUND")
				console.log("err")
				res.redirect("back")
			}
			else{	
				if(foundSechand.author.id.equals(req.user._id)){
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

