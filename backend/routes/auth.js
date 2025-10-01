const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Helper function to validate and sanitize email
const validateAndSanitizeEmail = email => {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Valid email is required" };
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitizedEmail)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true, email: sanitizedEmail };
};

// Helper function to validate subjects of interest
const validateSubjectsOfInterest = subjects_of_interest => {
  if (subjects_of_interest !== undefined) {
    if (!Array.isArray(subjects_of_interest)) {
      return { valid: false, error: "Subjects of interest must be an array" };
    }
    if (!subjects_of_interest.every(subject => typeof subject === "string")) {
      return { valid: false, error: "All subjects must be strings" };
    }
  }
  return { valid: true };
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, subjects_of_interest } = req.body;

    // Validate email
    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ detail: emailValidation.error });
    }
    const sanitizedEmail = emailValidation.email;

    // Validate password
    if (!password || typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ detail: "Password must be at least 6 characters long" });
    }

    // Validate name
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ detail: "Name is required" });
    }

    // Validate subjects_of_interest
    const subjectsValidation = validateSubjectsOfInterest(subjects_of_interest);
    if (!subjectsValidation.valid) {
      return res.status(400).json({ detail: subjectsValidation.error });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: sanitizedEmail,
      password,
      subjects_of_interest: subjects_of_interest || [],
    });

    await user.save();

    // Create access token
    const token = jwt.sign(
      { sub: user.email, id: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({
      access_token: token,
      token_type: "bearer",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    const emailValidation = validateAndSanitizeEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ detail: emailValidation.error });
    }
    const sanitizedEmail = emailValidation.email;

    // Validate password
    if (!password || typeof password !== "string") {
      return res.status(400).json({ detail: "Password is required" });
    }

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ detail: "Incorrect email or password" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ detail: "Incorrect email or password" });
    }

    // Create access token
    const token = jwt.sign(
      { sub: user.email, id: user.id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({
      access_token: token,
      token_type: "bearer",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      subjects_of_interest: user.subjects_of_interest,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, subjects_of_interest } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ detail: "Name is required" });
    }

    // Validate subjects_of_interest
    const subjectsValidation = validateSubjectsOfInterest(subjects_of_interest);
    if (!subjectsValidation.valid) {
      return res.status(400).json({ detail: subjectsValidation.error });
    }

    // Find and update user
    const user = await User.findOne({ email: req.user.sub });
    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    user.name = name.trim();
    if (subjects_of_interest && Array.isArray(subjects_of_interest)) {
      user.subjects_of_interest = subjects_of_interest;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subjects_of_interest: user.subjects_of_interest,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

module.exports = router;
