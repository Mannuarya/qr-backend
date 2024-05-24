const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // specify the directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // specify the file name
  },
});

const upload = multer({ storage: storage });

// Middleware to check token
const authMiddleware = (req, res, next) => {
  const token = req.header("auth");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
};

// Get User Route
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
});

// Get Profile Route
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
});

// Update Password Route
router.post("/update-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
});

// Update Profile Route
router.post(
  "/update-profile",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    const { name, contact, address } = req.body;
    const profileImage = req.file ? req.file.path : null;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(400).json({ msg: "User not found" });
      }

      user.name = name || user.name;
      user.contact = contact || user.contact;
      user.address = address || user.address;
      if (profileImage) {
        user.profileImage = profileImage;
      }

      await user.save();

      res.status(200).json({ msg: "Profile updated successfully", user });
    } catch (err) {
      res.status(400).json({ msg: "Token is not valid" });
    }
  },
);

const generateRandomPassword = (length) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const newPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await sendPasswordResetEmail(user.email, newPassword);

    res.status(200).json({
      msg: "Password reset successful. Please check your email for the new password.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

const sendPasswordResetEmail = async (email, newPassword) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "mannuarya2002@gmail.com",
      pass: "whrb cqwb rsep cgyq",
    },
  });

  const mailOptions = {
    from: '"Your Company Name" <mannuarya2002@gmail.com>', // You can replace "Your Company Name" with your actual company name
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://your-company-logo-url.com/logo.png" alt="Your Company Logo" style="max-width: 100px;" />
        </div>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #555;">
            Dear User,
          </p>
          <p style="color: #555;">
            We received a request to reset your password. Your new password is:
          </p>
          <p style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; color: #333;">
            ${newPassword}
          </p>
          <p style="color: #555;">
            Please use this password to log in and make sure to change it to something you can easily remember.
          </p>
        </div>
        <div style="margin-top: 20px; color: #555;">
          <p>
            If you did not request this password reset, please contact our support team immediately.
          </p>
          <p>
            <a href="https://your-company-website.com/support" style="color: #1a73e8; text-decoration: none;">Contact Support</a>
          </p>
        </div>
        <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; color: #777; text-align: center;">
          <p>
            &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
          <p>
            Your Company Address
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = router;
