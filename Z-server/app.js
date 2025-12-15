const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
dotenv.config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


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

// Logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use('/api/user', userRoutes);




app.get('/', (req,res)=>{
    res.send("Hello Rohit CHoukiker")
})

module.exports = app;


