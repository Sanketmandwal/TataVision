import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middlewares/auth.js";
import user from "../models/user.js";
const userrouter = express.Router();

// Public
userrouter.post("/signup", registerUser);
userrouter.post("/login", loginUser);

// Protected - dealer only
userrouter.get(
  "/dealer-dashboard",
  protect,
  authorizeRoles("dealer"),
  (req, res) => {
    res.json({ message: "Welcome Dealer", data: "Dealer analytics here" });
  }
);

// Protected - sales executive only
userrouter.get(
  "/sales-dashboard",
  protect,
  authorizeRoles("sales_exec"),
  (req, res) => {
    res.json({ message: "Welcome Sales Executive", data: "Sales summary here" });
  }
);

// Both roles (example: profile)
userrouter.get("/profile", protect, getProfile);

userrouter.get('/getuser', protect, async (req, res) => {
    try {
        res.json({ success: true, userData: req.user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

userrouter.post("/sales_exec", async (req, res) => {
  try {
    // --- MODIFIED: Read from req.body instead of req.query ---
    const { location } = req.body;
    console.log("Requested location:", location);

    if (!location) {
      return res.status(400).json({ error: "Location is required in the request body." });
    }

    const salesExecs = await user.find({ role: "sales_exec", location: location });
    res.json(salesExecs);
  } catch (err) {
    console.error("Error fetching sales executives:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

userrouter.post("/dealers", async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ error: "Location is required." });
    }
    // Find all users with the role 'dealer' in the specified location
    const dealers = await user.find({ role: "dealer", location: location });
    res.json(dealers);
  } catch (err) {
    console.error("Error fetching dealers:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});


export default userrouter;
