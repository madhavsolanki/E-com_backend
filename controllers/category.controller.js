import Category from "../models/category.model.js";
import slugify from "slugify";
import { uploadImageToCloudinary } from "../utils/uploadToCloudinary.utils.js";
import cloudinary from "../config/cloudinary.config.js";
import mongoose from "mongoose";

export const createCategoryController = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name)
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });

    // Slugify name
    const slug = slugify(name, { lower: true });

    // Upload Image to cloudinary
    let image = {};
    if (req.file) {
      const result = await uploadImageToCloudinary(
        req.file.buffer,
        `E-com Market/category_images`,
        slug
      );

      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      isSubCategory: !!parentCategory,
      createdBy: req.user._id,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log("Error in creating category: ", error);
    return res.status(500).json({
      success: false,
      message: "Category creation failed",
      error: error.message,
    });
  }
};

export const getAllCategoriesController = async (req, res) => {
  try {
    const { isSubCategory } = req.query;

    const filter = {};

    if (isSubCategory !== undefined) {
      filter.isSubCategory = isSubCategory === "true";
    }

    const categories = await Category.find(filter)
      .populate("parentCategory", "name slug") // populate only the relevent fields
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.log("Error fetching categories: ", error);
    return res.status(500).json({
      success: false,
      message: "failed to fetch categories",
      error: error.message,
    });
  }
};

export const getSingleCategoryController   = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let category;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      // Try by ObjectId
      category = await Category.findById(idOrSlug)
        .populate("createdBy", "username email")
        .populate("parentCategory", "name slug");
    } else {
      // Try By Slug
      category = await Category.findOne({ slug: idOrSlug })
        .populate("createdBy", "username email")
        .populate("parentCategory", "name slug");
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Find all subcategories if this is a parent category
    const subCategories = await Category.find({ parentCategory: category._id });

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      category,
      subCategories,
    });
  } catch (error) {
    console.error("Error fetching category: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    // validate the category id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Check if the category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { name, description, parentCategory } = req.body;

    if (name) {
      existingCategory.name = name;
      existingCategory.slug = slugify(name, { lower: true });
    }

    if (description) {
      existingCategory.description = description;
    }

    if (parentCategory) {
      existingCategory.parentCategory = parentCategory;
    }

    // Handle image replacement if provided
    if (req.file) {
      // Delete the existing image from Cloudinary
      if (existingCategory.image.public_id) {
        await cloudinary.uploader.destroy(existingCategory.image.public_id);
      }

      // Upload the new image
      const result = await uploadImageToCloudinary(
        req.file.buffer,
        `E-com Market/category_images`,
        existingCategory.slug
      );

      existingCategory.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    await existingCategory.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: existingCategory,
    });
  } catch (error) {
    console.error("Error updating category: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate objectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete the category image from Cloudinary
    if (category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    // If the provided category is a parent category, delete all its subcategories
    if(!category.isSubCategory){
      const subCategories = await Category.find({ parentCategory: id });

      // Delete the subcategories' images from Cloudinary
      for( const sub of subCategories){
        // Delete the subcategory image if exists 
        if(sub.image?.public_id){
          await cloudinary.uploader.destroy(sub.image.public_id);
        }
        await Category.findByIdAndDelete(sub._id);
      }
    }

    // Finally, delete the main category
    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.log("Error deleting category: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

export const getSubacategoriesController = async (req, res) => {
  try {
    
    const { parentId } = req.params;
    
    // Validate parent category Object Id
    if(!mongoose.Types.ObjectId.isValid(parentId)){
      return res.status(400).json({
        success: false,
        message: "Invalid parent category ID",  
      });
    }


    const subCategories = await Category.find({parentCategory: parentId});

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subCategories,
    });
  } catch (error) {
    console.log("Error fetching subcategories: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
      error: error.message,
    })
    
  }
};

export const searchCategoryController = async (req, res) => {
  try {
    const { q } = req.query;
    
    if(!q){
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const categories = await Category.find({
      $or: [
        { name: { $regex: q, $options: "i" } }, // Case-insensitive search by name
        { slug: { $regex: q, $options: "i" } }, // Case-insensitive search by slug
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });

  } catch (error) {
    console.log("Error fetching categories: ", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

