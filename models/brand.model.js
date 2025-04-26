import mongoose from "mongoose";
import slugify from "slugify";  // Importing slugify to generate slugs from brand names

const brandSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: [true, "Please provide a brand name"],
    trim: true,
    unique: true, // Ensure brand name is unique
  },

  slug: {
    type: String,
    required: true,
    unique: true, // Ensures each brand has a unique slug for clean URLs
    lowercase: true, // To maintain consistency in slugs
  },

  description: {
    type: String,
    required: false,
    trim: true,
  },

  logo: {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },

  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to the Category model
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (Admin who added the brand)
    required: true,
  },
}, { timestamps: true });

/*
Middleware to generate slug before saving
brandSchema.pre('save', function(next) {
  Check if the slug is already present, if not, generate it
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, replacement: '-' });
  }
  next();
});


Ensure the slug is unique before saving
brandSchema.index({ slug: 1 }, { unique: true });
*/


const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
