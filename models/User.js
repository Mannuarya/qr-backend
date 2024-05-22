const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: Number, required: true },
    address:{type:String, required:true},
    isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("NewUser", UserSchema);
