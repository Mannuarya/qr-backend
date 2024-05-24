const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const verifyEmail = require("../utils/verifyEmail");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Enter a valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, contact, address } = req.body;

    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(205).json({ msg: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        contact,
        address,
      });
      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
        expiresIn: "1h",
      });
      verifyEmail(email, token);
      await newUser.save();

      res
        .status(201)
        .json({ msg: "User registered, please verify your email" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  },
);

// Verify Email Route
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      msg: "Email verified successfully",
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
