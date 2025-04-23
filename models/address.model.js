import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  address:{
    type:String,
  },
  city:{
    type:String,
  },
  zipCode:{
    type:String,
  },
  state:{
    type:String,
  },
  country:{
    type:String,
  },   
  
},{timestamps:true});

const Address = mongoose.model("Address", addressSchema);

export default Address;