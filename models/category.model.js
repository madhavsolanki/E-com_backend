import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true,
    unique:true
  },

  slug:{
    type:String,
    unique:true
  },

  description:{
    type:String,
  },

  image:{
    url:String,
    public_id:String,
  },

  parentCategory:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
    default:null
  },

  isSubCategory:{
    type:Boolean,
    default:false
  },

  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

},{timestamps:true});


// Generate Slug before saving
categorySchema.pre("save", function(next){
  if(this.isModified("name")){
    this.slug = slugify(this.name, {lower:true});
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;