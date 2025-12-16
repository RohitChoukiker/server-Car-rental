const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Car = require('../models/car-model');

router.get("/get-cars", catchAsync(async (req, res) => {
  const cars = await Car.find({ isAvaliable: true });

  res.status(200).json({
    success: true,
    cars,
  });
}));

router.get("/get-car/:id", catchAsync(async (req, res) => {
  const carId = req.params.id;
  const car = await Car.findById(carId).populate('owner');

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found',
    });
  }

  res.status(200).json({
    success: true,
    data: car,
  });
}));




module.exports = router;