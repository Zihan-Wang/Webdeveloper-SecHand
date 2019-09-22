const express = require("express"),
	  router  = express.Router(),
	  passport = require("passport"),
	  User = require("../models/user"),
	  Campground = require("../models/campground");
	
async = require("async");
const nodemailer= require("nodemailer");
const crypto = require("crypto");

router.get("/", (req, res) => {
	res.render("campgrounds/landing");
})

router.get("/register",(req,res)=>{
	res.render("register");
})

router.post("/register",(req,res)=>{
	User.register(new User({
		username: req.body.username, 
		first: req.body.first, 
		last: req.body.last,
		email: req.body.email,
		avatar: req.body.avatar}), req.body.password, (err, user)=>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to be a campYelper")
			res.redirect("/campgrounds");
		})
	})
})

//show login
router.get("/login", (req, res)=>{
	res.render("login");
})

router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), (req, res)=>{
})

//show logout
router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("success","Logged you out")
	res.redirect("/campgrounds");
})

router.get("/users/:id", (req, res)=>{
	User.findById(req.params.id, (err, foundUser)=>{
		if(err) {
			req.flash("error", "can't find your file");
			res.redirect("/");
		}
		else {
			Campground.find().where('author.id').equals(foundUser.id).exec((err, campgrounds)=>{
				if(err) {
					req.flash("error", "wrong operation");
					res.redirect("/");
				}
				else {
					res.render("users/file", {user: foundUser, campgrounds: campgrounds})
				}
			})
		}
	})
})
router.get('/forgot', function(req, res) {
  res.render('users/forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'zihanhahaha@gmail.com',
          pass: 'Wzh19970113'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'zihanhahaha@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('users/reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'zihanhahaha@gmail.com',
          pass: 'Wzh19970113'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'zihanhahaha@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});

module.exports = router;