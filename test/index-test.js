import express from "express";
import cors from "cors";
import upload from "./upload-route.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/upload", upload);

const PORT = process.env.TEST_PORT || 4000;

app.listen(PORT, () => {
  console.log(`Test Server running on http://localhost:${PORT}`);
});
