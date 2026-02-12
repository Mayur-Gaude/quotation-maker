// src/app.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import quotationRoutes from "./routes/quotationRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS for all origins (change in production as needed)
app.use(cors());

// Health check
app.get("/", (req, res) => {
    res.send("Quotation Maker API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quotations", quotationRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
