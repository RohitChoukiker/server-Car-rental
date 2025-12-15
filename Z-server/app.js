const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/user', userRoutes);




app.get('/', (req,res)=>{
    res.send("Hello Rohit CHoukiker")
})

module.exports = app;


