import express from "express";
import {
  changeBookingStatus,
  checkAvailabilityOfCar,
  createBooking,
  getOwnerBookings,
  getUserBookings,
} from "../controllers/booking.controller.js";
import protect from "../middleware/auth.middleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfCar); // Public route to check car availability
bookingRouter.post("/create", protect, createBooking); // Protected route to create a booking
bookingRouter.get("/user", protect, getUserBookings); // Get bookings for the authenticated user
bookingRouter.get("/owner", protect, getOwnerBookings); // Get bookings for the authenticated owner
bookingRouter.post("/change-status", protect, changeBookingStatus); // Change booking status

export default bookingRouter;
