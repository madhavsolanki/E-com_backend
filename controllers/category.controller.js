import Category from "../models/category.model.js";
import slugify from "slugify";
import { uploadImageToCloudinary } from "../utils/uploadToCloudinary.utils.js";


export const createCategoryController = async (req, res) => {
  try {
    const { name, description, parentCategory} = req.body;

    if(!name) return res.status(400).json({
      success: false,
      message: "Category name is required"
    });

    // Slugify name
    const slug = slugify(name, { lower: true});

    // Upload Image to cloudinary
    let image = {};
    if(req.file){
      const result = await uploadImageToCloudinary(
        req.file.buffer,
        `E-com Market/category_images/${slug}`,
        slug
      );

      image = {
        url:result.secure_url,
        public_id: result.public_id
      };
    }

    const category  = new Category({
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
      success:true,
      message:"Category created successfully",
      category
    });

  } catch (error) {
    console.log("Error in creating category: ", error);
    return res.status(500).json({
      success:false,
      message:"Category creation failed",
      error:error.message
    });        
  }
};

export const getAllCategoriesController = async (req, res) => {
  try {
    const {isSubCategory} = req.query;

    const filter = {};

    if(isSubCategory !== undefined) {
      filter.isSubCategory = isSubCategory === "true";
    }

    const categories= await Category.find(filter)
    .populate("parentCategory", "name slug") // populate only the relevent fields
    .sort({createdAt: -1});


    return res.status(200).json({
      success:true,
      message:"Categories fetched successfully",
      categories
    });

  } catch (error) {
    console.log("Error fetching categories: ", error);
    return res.status(500).json({
      success:false,
      message:"failed to fetch categories",
      error: error.message
    }); 
  }
};