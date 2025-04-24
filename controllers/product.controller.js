import Product from "../models/product.model.js";
import { uploadImageToCloudinary } from "../utils/uploadToCloudinary.utils.js";

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      images, // Expecting an array of { url, public_id }
    } = req.body;
    
    if(!req.files || req.files.length < 2 || req.files.length > 5){
      return re.status(400).json({
        success:false,
        message:"Please upload between 2 to 5 images"
      });
    }

    // validation 
    if(!name || !description || !price || !stock || !category){
      return res.status(400).json({
        success:false,
        message:"Please provide all required fields"
      });
    }

    // Create a new Product
    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      brand,
      images,
      createdBy: req.user._id
    });
    
    await product.save();

    // Upload each images to cloudinary
    const imageUploadPromises = req.files.map((file, index) => 
      uploadImageToCloudinary(
        file.buffer,
        `E-com Market/product_images/${product._id}`,
        `product_${index + 1}`
      )
    );

    const uploadedImages = await Promise.all(imageUploadPromises);

    product.images = uploadedImages.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    await product.save();

    return res.status(201).json({
      success:true,
      message:"Product created successfully",
      product
    });

  } catch (error) {

    console.error("Error in creating product: ", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};


