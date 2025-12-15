const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

module.exports = async (req, res, next) => {
  try {
    let token;

    // JWT Authorization header se uthao
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in",
      });
    }

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User lao
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // req me user attach
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
