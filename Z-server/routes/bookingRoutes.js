const express = require("express");
const router = express.Router();
const Car = require("../models/car-model");
const Booking = require("../models/booking-model");
const catchAsync = require("../utils/catchAsync");
const protect = require("../middleware/auth-middleware");
const restrictedTo = require("../middleware/restrictTo-middleware");

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

      if (!car.isAvaliable) {
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

    car.isAvaliable = false;
    await car.save();

  
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });

  })
  
);

router.get(
  "/my-booking",protect,  catchAsync(async (req, res) => {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate("car")
      .populate("owner", "name email");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  })
);
router.get(
  "/owner-bookings",
  protect,
  restrictedTo("owner"),
  catchAsync(async (req, res) => {
    const ownerId = req.user._id;

    const bookings = await Booking.find({ owner: ownerId })
      .populate("car")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      data: bookings,
    });
  })
);

router.post(
  "/confirmation",
  catchAsync(async (req, res) => {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and status are required",
      });
    }

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;
    await booking.save();


    if (status === "cancelled") {
      const car = await Car.findById(booking.car._id);
      car.isAvaliable = true;
      await car.save();
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  })
);

router.post(
  "/cancel",
  catchAsync(async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "cancelled";
    await booking.save();

  
    const car = await Car.findById(booking.car._id);
    car.isAvaliable = true;
    await car.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  })
);

module.exports = router;
