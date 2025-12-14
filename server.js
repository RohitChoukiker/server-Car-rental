import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/mongodb.configs.js";
import userRouter from "./routes/user.routes.js";
import ownerRouter from "./routes/owner.route.js";
import bookingRouter from "./routes/booking.routes.js";

const app = express();
const port = process.env.PORT || 3000;

await connectDB();

app.use( cors({
    origin:  process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("SERVER IS RUNNING...");
});

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
