import express from "express";
import protect from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import {
  addCar,
  changeRoleOwner,
  deleteCar,
  getDashboardData,
  getOwnerCars,
  toggleCarAvailability,
  updateUserImage,
} from "../controllers/owner.controller.js";


const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleOwner); // Protect this route to ensure only authenticated users can change their role

ownerRouter.post("/add-car", protect, upload.single("image"), addCar);

ownerRouter.get("/cars", protect, getOwnerCars); // Get all cars listed by the owner
ownerRouter.post("/toggle-car", protect, toggleCarAvailability); // Toggle car availability
ownerRouter.post("/delete-car", protect, deleteCar); // Delete a car
ownerRouter.get("/dashboard", protect, getDashboardData); // Get dashboard data

ownerRouter.post("/update-image", protect, upload.single("image"), updateUserImage); // Update user profile image
export default ownerRouter;
