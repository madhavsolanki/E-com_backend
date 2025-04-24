import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim: true
  },

  description:{
    type:String,
    required:true
  },

  price:{
    type:Number,
    required:true
  },

  stock:{
    type:Number,
    required:true,
    default:0
  },
  category:{
    type:String,
    required:true,
  },

  brand:{
    type:String,
    default:"No brand"
  },

  images:[
    {
      url:String,
      public_id:String
    }
  ],

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    }
  ],

  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",                      // Admin user who added the product
    required:true,
  },

},{timestamps: true});


const Product = mongoose.model("Product", productSchema);

export default Product;