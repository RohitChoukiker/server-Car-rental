const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Car = require('../models/car-model');
const restrictedTo = require('../middleware/restrictTo-middleware');
const portect = require('../middleware/auth-middleware');

router.post('/add-car', portect,  restrictedTo("owner"), catchAsync(async (req, res) => {
//   console.log(req.user._id);
  const ownerId = req.user._id;
  const {
    brand,
    model,
    image,
    year,
    category,
    seating_capacity,
    fuel_type,
    transmission,
    pricePerDay,
    location,
    description,    
  } = req.body;

  const car = await Car.create({
      owner: ownerId,
      brand,
      model,
      year,
      category,
      seating_capacity,
      fuel_type,
      transmission,
      pricePerDay,
      location,
      description,
      image: 9,
      isAvaliable: true,
    });

    res.status(201).json({
      success: true,
      message: 'Car added successfully',
      data: car,
    });
}));

router.post('/toggle-availability', portect, restrictedTo("owner"), catchAsync(async (req, res) => {
  const { carId } = req.body;
  const ownerId = req.user._id;

  if (!carId) {
      return res.status(400).json({
        success: false,
        message: "Car ID is required",
      });
    }

  const car = await Car.findById(carId);

  if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }
    
  // Check if the logged-in user is the owner of the car
  if (car.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this car",
      });
    }
    
   car.isAvaliable = !car.isAvaliable;
    await car.save();

    res.status(200).json({
      success: true,
      message: "Car availability toggled successfully",
      data: car,
    });

}));


router.get('/get-owner-cars', portect, restrictedTo("owner"), catchAsync(async (req, res) => {
  const ownerId = req.user._id;
  const cars = await Car.find({ owner: ownerId }).populate('owner');
  
  res.status(200).json({
    success: true,
    results: cars.length,
    data: cars,
  });
}));





router.delete('/remove-car',  portect, restrictedTo("owner"), catchAsync(async (req, res) => {
  const { carId } = req.body;
  const ownerId = req.user._id;

  if (!carId) {
    return res.status(400).json({
      success: false,
      message: 'Car ID is required',
    });
  }

  const car = await Car.findById(carId);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found',
    });
  }

  // Check if the logged-in user is the owner of the car
  if (car.owner.toString() !== ownerId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to remove this car',
    });
  }
  // console.log("Car to be removed:", car.owner.toString(), ownerId.toString());

  await Car.findByIdAndDelete(carId);

  res.status(200).json({
    success: true,
    message: 'Car removed successfully',
  });
}));





module.exports = router;