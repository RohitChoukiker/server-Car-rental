import imagekit from "../configs/imagKit.js";
import Booking from "../models/booking.js";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";

export const changeRoleOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    
    await User.findByIdAndUpdate(_id, { role: "owner" });
    
    return res.status(200).json({
      success: true,
      message: "Now you can list cars",
    });
  } catch (error) {
    console.error("Change role error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addCar = async (req, res) => {
  try {
    console.log("=== ADD CAR DEBUG ===");
    console.log("req.user:", req.user);
    console.log("req.file:", req.file ? "File exists" : "No file");
    console.log("req.body:", req.body);
    
    // First check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log("Add car error: req.user not found");
      return res.status(401).json({
        success: false,
        message: "Your account cannot be authenticated.",
      });
    }

    // Then check if file is uploaded
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Car image is required!",
      });
    }

    const ownerId = req.user._id;
    const carData = JSON.parse(req.body.carData || "{}");

    const uploadedFile = await imagekit.upload({
      file: req.file.buffer.toString("base64"),
      fileName: `car_${Date.now()}.jpg`,
    });

    const car = await Car.create({
      ...carData,
      image: uploadedFile.url,
      owner: ownerId,
    });

    return res.status(200).json({
      success: true,
      message: "Car Listed Successfully!",
      car,
    });
  } catch (error) {
    console.log("Add car error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while adding car.",
    });
  }
};


export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    
    const cars = await Car.find({ owner: _id }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      message: "Cars retrieved successfully",
      cars
    });
  } catch (error) {
    console.error("Get owner cars error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "Car ID is required"
      });
    }

    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found"
      });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only modify your own cars."
      });
    }

    car.isAvaliable = !car.isAvaliable;
    await car.save();

    return res.status(200).json({
      success: true,
      message: `Car ${car.isAvaliable ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error("Toggle car availability error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;

    if (!carId) {
      return res.status(400).json({
        success: false,
        message: "Car ID is required"
      });
    }

    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found"
      });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. You can only delete your own cars."
      });
    }

    // Soft delete - remove owner and mark as unavailable
    car.owner = null;
    car.isAvaliable = false;
    await car.save();

    return res.status(200).json({
      success: true,
      message: "Car removed successfully"
    });
  } catch (error) {
    console.error("Delete car error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Owner role required."
      });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    const pendingBookings = bookings.filter(b => b.status === "pending");
    const completedBookings = bookings.filter(b => b.status === "confirmed");

    const monthlyRevenue = completedBookings.reduce(
      (acc, booking) => acc + booking.price,
      0
    );

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    return res.json({ success: true, dashboardData });
  } catch (error) {
    console.error("Get dashboard data error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    if (!imageFile || !imageFile.buffer) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }

    const response = await imagekit.upload({
      file: imageFile.buffer.toString("base64"),
      fileName: `user_${Date.now()}_${imageFile.originalname}`,
      folder: "/users",
    });

    const imageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "400" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    await User.findByIdAndUpdate(_id, { image: imageURL });

    return res.json({
      success: true,
      message: "Profile image updated successfully"
    });
  } catch (error) {
    console.error("Update user image error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};