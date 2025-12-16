const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cors = require('cors');
dotenv.config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use( cors({
    origin:  process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));


app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parse Error:', err.message);
        console.error('Request body:', req.body);
        return res.status(400).json({ 
            status: 'error',
            message: 'Invalid JSON format in request body',
            details: err.message 
        });
    }
    next();
});



app.use('/api/user', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/booking', bookingRoutes);




app.get('/', (req,res)=>{
    res.send("Hello Rohit CHoukiker")
})

module.exports = app;


