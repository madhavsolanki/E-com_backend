import express from "express";
import isUserAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.middleware.js";
import { createProductController } from "../controllers/product.controller.js";
import { productImageUpload } from "../config/multer.config.js";

const router = express.Router();

router.post(
  "/admin/create",
  isUserAuthenticated,
  authorizeRoles("admin"),
  productImageUpload.array("images", 5),
  createProductController
);

export default router;
