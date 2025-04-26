import express from "express";
import isUserAuthenticated from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.middleware.js";
import { brandImageUpload } from "../config/multer.config.js";
import { createBrand, deleteBrand, getAllBrandsController, getBrandsBySubcategoryController, updateBrand } from "../controllers/brand.controller.js";

const router = express.Router();

router.post(
  "/admin/create/:id",
  isUserAuthenticated,
  authorizeRoles("admin"),
  brandImageUpload.single("logo"),
  createBrand
);

router.get("/", isUserAuthenticated, getAllBrandsController);

router.get("/subcategory/:subcatId", getBrandsBySubcategoryController);

router.put("/admin/update/:id", isUserAuthenticated, authorizeRoles("admin"), brandImageUpload.single("logo"), updateBrand);

router.delete("/admin/delete/:id", isUserAuthenticated, authorizeRoles("admin"), deleteBrand);


export default router;
