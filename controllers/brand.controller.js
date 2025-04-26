import Brand from "../models/brand.model.js";
import Category from "../models/category.model.js";
import slugify from "slugify";
import { uploadImageToCloudinary } from "../utils/uploadToCloudinary.utils.js";
import cloudinary from "../config/cloudinary.config.js";

export const createBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // check sub category is provided or not 
    if(!id){
      return res.status(400).json({
        success: false,
        message: "Please provide sub category"
      });
    }

    // Find the subcategory and ensures its a valid id
    const category = await Category.findById(id);

    if(!category){
      return res.status(400).json({
        success: false,
        message: "Please provide valid sub category"
      });
    }

    // Ensure the provided sub category is Not a parent category
    if(!category.parentCategory){
      return res.status(400).json({
        success: false,
        message: "Provided category is a parent category, not a subcategory"
      });
    }

    // create a slug for the brand name
    const slug = slugify(name, { lower: true, replacement: "-" });


    // upload the logo to cloudinary if present
    let logo = {};
    if(req.file){
      const result = await uploadImageToCloudinary(
        req.file.buffer,
        `E-com Market/brand_logos`,
        slug
      );
      logo = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // Create the new Brand document
    const brand = new Brand({
      name,
      slug,
      description,
      logo,
      subcategory: id,   // Reference to the subcategory ID
      createdBy: req.user._id,   // Assuming the logged-in user is the admin
    });

    // save the brand in the databse
    await brand.save();

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      brand,
    });

  } catch (error) {
    console.error("Error creating brand:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: error.message,
    });    
  }
};

export const getAllBrandsController = async (req, res) => {
  try {
    const brandsGroupBySubcategory = await Brand.aggregate([
      {
        $lookup:{
          from :"categories", // collection name of category 
          localField: "subcategory",
          foreignField: "_id",
          as: "subcategoryDetails",
        }
      },
      {
        $unwind:"$subcategoryDetails"
      },
      {
        $group:{
          _id:"$subcategoryDetails._id",
          subcategoryName:{$first:"$subcategoryDetails.name"},
          brands: { $push: {
            _id:"$_id",
            name:"$name",
            slug:"$slug",
            description:"$description",
            logo:"$logo",
            createdBy:"$createdBy",
            createdAt:"$createdAt",
            updatedAt:"$updatedAt",
          } },
        }
      },
      {
        $sort: {
          subcategoryName:1,  // sort by subcategory name alphabetically
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      brandsGroupBySubcategory,
    });

  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};

export const getBrandsBySubcategoryController = async (req, res) => {
  try {
    const { subcatId} = req.params;

    // Check if the subcategory exists
    const subcategory = await Category.findById(subcatId);
    if(!subcategory || !subcategory.parentCategory){
      return res.status(400).json({
        success: false,
        message: "Subcategory not found or is Not a valid subcategory"
      });
    }

    // Fetch brands belongs to the subcategory
    const brands = await Brand.find({subcategory : subcatId}).populate("subcategory", "name");

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      data:brands,
    });

  } catch (error) {
    console.log("Error fetching brands:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: error.message,
    });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;  // Brand ID from URL params
    const { name, description, subcategory } = req.body;
    
    const brand = await Brand.findById(id);

    if(!brand){
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }
    
    // if subcategory is being updated , validate it 
    if(subcategory){
      const cat = await Category.findById(subcategory);

      if(!cat || !cat.parentCategory){
        return res.status(400).json({
          success: false,
          message: "Subcategory not found or is not a valid subcategory",
        });
      }
      brand.subcategory = subcategory;
    }

    // update name and regenmerate slug if name is being updated
    if(name){
      brand.name = name;
      brand.slug = slugify(name, { lower: true, replacement: "-" });
    }

    if(description) brand.description = description;

    // If new logo added then in that case delete old one andm upload new one
    if(req.file){
      // Delete the old logo from cloudinary
      if(brand.logo?.public_id){
        await cloudinary.uploader.destroy(brand.logo.public_id);
      }
    }

    // Upload the new logo to cloudinary if present
    const result = await uploadImageToCloudinary(
      req.file.buffer,
      "E-com Market/brand_logos",
      brand.slug
    );

    // update logo
    brand.logo = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    // save the updated brand
    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      brand,
    });

  } catch (error) {
    console.log("Error updating brand:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: error.message,
    });
  }
};


export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findById(id);

    if(!brand){
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }
    

    // Delete the brand logo from cloudinary if it exists
    if(brand.logo?.public_id){
      await cloudinary.uploader.destroy(brand.logo.public_id);
    }

    // Delete the brand from the database
    await brand.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });

  } catch (error) {
    console.log("Error deleting brand:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: error.message,
    });
    
  }
};
