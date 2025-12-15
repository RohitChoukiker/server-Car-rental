const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();




app.get('/', (req,res)=>{
    res.send("Hello Rohit CHoukiker")
})

module.exports = app;


