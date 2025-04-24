import express from "express";
import isUserAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.middleware.js";
import { categoryImageUpload } from "../config/multer.config.js";
import { createCategoryController, getAllCategoriesController } from "../controllers/category.controller.js";

const router = express.Router();

router.post(
  "/admin/create",
  isUserAuthenticated,
  authorizeRoles("admin"),
  categoryImageUpload.single("image"),
  createCategoryController
);

router.get("/", getAllCategoriesController);

export default router;
