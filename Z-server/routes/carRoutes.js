const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Car = require('../models/car-model');

router.get("/get-cars", catchAsync(async (req, res) => {
  const cars = await Car.find({ isAvailable: true });

  res.status(200).json({
    success: true,
    cars,
  });
}));

router.get("/get-car/:id", catchAsync(async (req, res) => {}));




module.exports = router;