const mongoose = require("mongoose"),
	  passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
	username: String,
	first: String,
	last: String,
	password: String,
	avatar: String, 
	email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);