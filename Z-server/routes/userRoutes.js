const express   = require('express');
const router = express.Router();

router.post('/register', async (req, res) => {
    // Registration logic here
    res.send('User registered');
});

router.post('/login', async (req, res) => {
    // Login logic here
    res.send('User logged in');
});

router.get('/me', async (req, res) => {
    // Get user data logic here
    res.send('User data');
});

router.put('/update', async (req, res) => {
    // Update user data logic here
    res.send('User data updated');
});











module.exports = router;