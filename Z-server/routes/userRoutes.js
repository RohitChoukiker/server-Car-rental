const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
 
const jwt = require("jsonwebtoken");
const protect = require("../middleware/auth-middleware");

router.post("/sign-up",
  catchAsync(async (req, res) => {
     console.log( req.body.role);

     if(!req.body.name || !req.body.email || !req.body.password || !req.body.passwordConfirm){
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields",
      });
     }

     const existingUser = await User.findOne({email: req.body.email});
     if(existingUser){
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
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide email and password",
        });
    }
    
    const user = await User.findOne({ email }).select("+password");
    
    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({
            status: "fail",
            message: "Incorrect email or password",
        });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    
    
    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        data: { token },
    });
}
   
); 

router.get("/me",protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.put("/update", protect, catchAsync(async (req, res) => {
  const { name, email } = req.body;

  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: "fail",
      message: "This route is not for password updates",
    });
  }

  // Check if email is being changed and if it already exists
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }
  }

  // Update user data
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone,
      address: address || req.user.address,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "User data updated successfully",
    data: {
      user: updatedUser,
    },
  });
}));

router.delete("/delete-me", protect, async (req, res) => {
  const user = await User.findByIdAndDelete(req.user._id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});

router.post("/logout", (req, res) => {
  
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
   
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});



module.exports = router;
