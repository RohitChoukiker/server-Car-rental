import express from "express";
import {getCars,getUserData,loginUser,registerUser,} from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser); // Register route
userRouter.post("/login", loginUser); // Login route
userRouter.get("/data", protect, getUserData); // Get user data route
userRouter.get("/cars", getCars); // Get available cars route

export default userRouter;
