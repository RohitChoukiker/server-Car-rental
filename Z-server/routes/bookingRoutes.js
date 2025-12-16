const express = require('express');
const router = express.Router();
const Car = require('../models/car-model');
const catchAsync = require('../utils/catchAsync');


router.post('/create', catchAsync(async (req, res) => {}));

router.get('/my-booking', catchAsync(async (req, res) => {}));

router.get('/owner-bookings', catchAsync(async (req, res) => {}));



router.post('/confirmation', catchAsync(async (req, res) => {}));


router.post('/cancel', catchAsync(async (req, res) => {}));




module.exports = router;
