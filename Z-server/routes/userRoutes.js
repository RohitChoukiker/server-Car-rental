const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user-model");

router.post("/sign-up",
  catchAsync(async (req, res) => {
     console.log( req.body.role);

     if(!req.body.name || !req.body.email || !req.body.password || !req.body.passwordConfirm){
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields",
      });
     }

     if(User.findOne({email: req.body.email})){
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
     }

     if(req.body.password.length < 6){
        return res.status(400).json({
          status: "fail",
          message: "Password must be at least 6 characters long",
        });
     }
     
     if(req.body.password !== req.body.passwordConfirm){

        return res.status(400).json({   
          status: "fail",
          message: "Passwords do not match",
        });
     }

    const allowedRole = ["owner", "user"];
    if (req.body.role && !allowedRole.includes(req.body.role)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid role specified",
      });
    }


    const newUser = await User.create(req.body);

   

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  })
);

router.post("/login", async (req, res) => {
   
  res.send("User logged in");
});

router.get("/me", async (req, res) => {
  // Get user data logic here
  res.send("User data");
});

router.put("/update", async (req, res) => {
  // Update user data logic here
  res.send("User data updated");
});

router.delete("/delete", async (req, res) => {
  // Delete user logic here
  res.send("User deleted");
});

router.post("/logout", async (req, res) => {
  // User logout logic here
  res.send("User logged out");
}
);  


module.exports = router;
