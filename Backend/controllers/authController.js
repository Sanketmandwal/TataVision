import User from "../models/user.js";
import { createtokenforuser } from "../services/auth.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user
    const user = new User({ name, email, password, role, location });
    await user.save();

    // Generate token
    const token = createtokenforuser(user);

    return res.json({
      success: true,
      message: "User Registered Successfully",
      token,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await User.matchPassword(email, password);

    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(400).json({ message: err.message });
  }
};


// profile (example protected route)
export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};
