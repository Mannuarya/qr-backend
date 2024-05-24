const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
    },
    address: {
        type: String,
    },
    profileImage: {
        type: String, // this field stores the path to the uploaded image
        default:
            "https://img.icons8.com/?size=100&id=492ILERveW8G&format=png&color=000000", // this is the default image to display if no image is uploaded
    },
});

module.exports = mongoose.model("NewUser", UserSchema);
