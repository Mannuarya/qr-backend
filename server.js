const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
// const crypto = require("crypto");
const { check, validationResult } = require("express-validator");

const User = require("./models/User");
const verifyEmail = require("./utils/verifyEmail");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = "your_jwt_secret";

mongoose.connect(
  // "mongodb+srv://mannuarya2002:manishmongo@cluster0.kquyzjn.mongodb.net/",
  "mongodb+srv://abhijeetsinghrana2003:mongoDBaBHI5@cluster0.dxdvwer.mongodb.net/",
);

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post(
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

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    user.isVerified = true;
    await user.save();

    res
      .status(200)
      .json({
        msg: "Email verified successfully",
        name: user.name,
        email: user.email,
      });
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
});

app.post("/login", async (req, res) => {
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

app.get("/user", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const qrCode = await QRCode.toDataURL(JSON.stringify(user));
    res.status(200).json({ user, qrCode });
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
