import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    unique:true
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

});

userSchema.pre("save", async function(next){
  if(!this.isModified("password")){
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

userSchema.methods.matchPassword = async function(enterdPassword){
  return await bcrypt.compare(enterdPassword, this.password);
}


const User = mongoose.model("User", userSchema);

export default User;