import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/dbConnection.config.js';
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();


const PORT = process.env.PORT || 5000;

// Express middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



// Db connection
connectDB();

app.use("/api/v1/auth", authRoutes);

// Server listening 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});