import express from "express";
import isUserAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.middleware.js";
import { categoryImageUpload } from "../config/multer.config.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getSingleCategoryController,
  getSubacategoriesController,
  searchCategoryController,
  updateCategoryController,
} from "../controllers/category.controller.js";

const router = express.Router();

router.post(
  "/admin/create",
  isUserAuthenticated,
  authorizeRoles("admin"),
  categoryImageUpload.single("image"),
  createCategoryController
);

router.get("/", getAllCategoriesController);

router.get("/single/:idOrSlug", getSingleCategoryController);

router.put("/admin/update/:id", isUserAuthenticated, authorizeRoles("admin"), categoryImageUpload.single("image"), updateCategoryController);

router.delete("/admin/delete/:id", isUserAuthenticated, authorizeRoles("admin"), deleteCategoryController);

router.get('/subcategories/:parentId', isUserAuthenticated, getSubacategoriesController);

router.get('/search', isUserAuthenticated, searchCategoryController);

export default router;
