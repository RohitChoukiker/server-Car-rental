const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      // validate(value){
      //     if(!validator.isEmail(value)){
      //         throw new Error("Please enter a valid email address");
      //     }
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      maxlength: 64,
      minlength: 6,
    },

    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          if (el !== this.password) {
            throw new Error("Passwords are not the same!");
          }
          message: "Passwords are not the same!";
        },
      },
    },

    role: {
      type: String,
      enum: ["owner", "user"],
      default: "user",
    },

  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;