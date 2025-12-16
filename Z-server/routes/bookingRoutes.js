const express = require("express");
const router = express.Router();
const Car = require("../models/car-model");
const catchAsync = require("../utils/catchAsync");
const protect = require("../middleware/auth-middleware");

router.post(
  "/create",
  protect,
  catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Car ID, start date and end date are required",
      });
    }
     const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

      if (!car.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Car is not available for booking",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

     const diffTime = end - start;
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


    const totalPrice = totalDays * car.pricePerDay;

    
    const booking = await Booking.create({
      user: userId,
      car: carId,
      startDate: start,
      endDate: end,
      totalDays,
      totalPrice,
      status: "confirmed",
    });

    car.isAvailable = false;
    await car.save();

  
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });

  })
  
);

router.get(
  "/my-booking",
  protect,
  catchAsync(async (req, res) => {})
);
router.get(
  "/owner-bookings",
  catchAsync(async (req, res) => {})
);

router.post(
  "/confirmation",
  catchAsync(async (req, res) => {})
);

router.post(
  "/cancel",
  catchAsync(async (req, res) => {})
);

module.exports = router;
