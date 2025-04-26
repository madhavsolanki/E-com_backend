import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/dbConnection.config.js';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import addressRoutes from "./routes/address.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";

// Load environment variables from .env file int
dotenv.config();

const app = express();


const PORT = process.env.PORT || 5000;

// Express middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



// Db connection
connectDB();

// APIS
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/brand", brandRoutes);



// Server listening 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});