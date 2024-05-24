const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

// Connect Database
connectDB();

// Init Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Define Routes
app.use("/api/auth", authRoutes); // Ensure these paths are correct
app.use("/api/user", userRoutes); // Ensure these paths are correct

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
