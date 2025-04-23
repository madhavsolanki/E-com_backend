import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  firstName : {
    type:String,
    required:true
  },
  lastName:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true
  },
  phoneNumber:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
  },
  role:{
    type:String,
    enum:["user", "admin"],
    default:"user"
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  verificationCode:{
    type:String,
  },

  addressBook:[{
    ref:"Address",
    type:mongoose.Schema.Types.ObjectId,
  }],

  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address"
  },

  profilePicUrl:{
    type:String,
    default:"https://res.cloudinary.com/drugllfyb/image/upload/v1745389662/tllvnenyn76gk6zuuy8a.jpg",
  },
  profilePublicId:{
    type:String,
    default:"E-com Market/user_profile_images/tllvnenyn76gk6zuuy8a"
  }
},{timestamps:true});


const User = mongoose.model("User", userSchema);

export default User;