const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Car = require('../models/car-model');

router.post('/add-car', catchAsync(async (req, res) => {
    const

}));

router.post('/toggle-car', catchAsync(async (req, res) => {}));


router.get('/get-owner-cars', catchAsync(async (req, res) => {}));





router.post('/remove-car', catchAsync(async (req, res) => {}));



router.post('/update-car', catchAsync(async (req, res) => {}));

module.exports = router;