import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("❌ No token found in headers");
    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found in database for token:", decoded.id);
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    console.log("✅ Authenticated user:", user.email);
    next();
  } catch (error) {
    console.log("❌ JWT verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};


export default protect;
