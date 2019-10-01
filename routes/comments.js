const express = require("express"),
	  router  = express.Router({mergeParams: true}),
	  Sechand = require("../models/sechand"),
	  Comment = require("../models/comment"),
	  middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn,(req,res)=>{
	Sechand.findById(req.params.id, (err, sechand)=>{
		if(err){
			res.redirect();
		}
		else{
			res.render("comments/new",{sechand:sechand});
		}
	})
})

router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup sechand using ID
   Sechand.findById(req.params.id, function(err, sechand){
       if(err){
           console.log(err);
           res.redirect("/sechands");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
			   comment.author.id = req.user._id;
			   comment.author.username = req.user.username;
			   comment.save();
               sechand.comments.push(comment);
               sechand.save();
			   req.flash("success", "Successfully added your comments")
               res.redirect('/sechands/' + sechand._id);
           }
        });
       }
   })
})

router.get("/:comment_id/edit", middleware.checkCommentOwnership,(req,res)=>{
	Comment.findById(req.params.comment_id, (err, foundComment)=>{
		if(err){
			res.redirect("back")
		}
		else{
			res.render("comments/edit",{sechand_id: req.params.id, comment: foundComment} );
		}
	})
})

router.put("/:comment_id", middleware.checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
		if(err){
			res.redirect("back")
		}
		else{
			res.redirect("/sechands/" + req.params.id)
		}
	})
})

router.delete("/:comment_id", middleware.checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndDelete(req.params.comment_id, (err)=>{
		if(err){
			res.redirect("back");
		}
		else{
			req.flash("success", "Successfully deleted!")
			res.redirect("/sechands/" + req.params.id);
		}
	})
})

module.exports = router;