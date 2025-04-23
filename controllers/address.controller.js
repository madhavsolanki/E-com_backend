import Address from "../models/address.model.js";
import  User from "../models/user.model.js";


export const addNewNewAddressController = async (req, res) => {
  try {
    const { address, city, zipCode, state, country} = req.body;

    if(!address || !city || !zipCode || !state || !country){
        return res.status(400).json({
          success:false,
          message:"Please provide all fields"
        });
    }

    const user = User.findById(req.user._id);

    if(!user) {
      return res.status(404).json({
        success:false,
        message:"User Not Found",
      });
    }

    const newAddress = new Address({
      userId:req.user._id,
      address,
      city,
      zipCode,
      state,
      country
    });

    await newAddress.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: {addressBook: newAddress._id}
    });

    return res.status(201).json({
      success:true,
      message:"Address Added Successfully",
      address:newAddress
    });

  } catch (error) {
    console.log("Error in Saving Address: ", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};

export const getAllUserAddressController = async (req, res) => {
  try {
    
    const user = User.findById(req.user._id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User Not found"
      });
    }

    const addresses = await Address.find({ userId: req.user._id }).sort({createdAt: -1});

    return res.status(200).json({
      success:true,
      message:"Address fetch Successfully",
      addresses
    });

  } catch (error) {
    console.log("Error in get User addresses: ", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};

export const getAddressById = async (req, res) => {
  try {
    
    const { id  } = req.params;

    const address = await Address.findById(id);
    if(!address){
      return res.status(404).json({
        success:false,
        message:"address not found"
      });
    }

    return res.status(200).json({
      success:true,
      message:"Address fetched successfully",
      address
    });


  } catch (error) {
    console.log("error in fetching address", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};

export const updateAddressController = async (req, res) => {
  try {
    
    const {id} = req.params;

    const userId = req.user._id;

    const { address, city, zipCode, state, country } = req.body;

    // Find the address 
    const existingAddress = await Address.findById(id);

    if(!existingAddress){
      return res.status(404).json({
        success:false,
        message:"Address not found"
      });
    }


    // Check if the address belongs to the logged in user 
    const user = await User.findById(userId);
    if(!user.addressBook.includes(id)){
      return res.status(403).json({
        success:false,
        message:"You are not authorized to update this address"
      });
    }

    // update only the only the provided fields
    if(address !== undefined ) existingAddress.address = address;
    if(city !== undefined) existingAddress.city = city;
    if(zipCode !== undefined) existingAddress.zipCode = zipCode;
    if(state !== undefined) existingAddress.state = state;
    if(country !== undefined) existingAddress.country = country;

    // save the address
    const updatedAddress = await existingAddress.save();

    return res.status(200).json({
      success: true,
      message:"Address mupdated successfully",
      address:updatedAddress
    });

  } catch (error) {
    console.log("Error in updating address: ",error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};

export const deleteAddressController = async (req, res) => {
  try {
    
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if(!user) {
      return res.status(404).json({
        success:false,
        message:"User Not found"
      });
    } 


    const address = Address.findById(id);
    if(!address){
      return res.status(404).json({
        success:false,
        message:"address not found"
      });
    }

    // Verify the logged in user id the owner of the address
    if(!user.addressBook.includes(id)){
      return res.status(403).json({
        success:false,
        message:"You are not authorized to delete this address"
      });
    }

    // Remove the address from the users address book
    user.addressBook = user.addressBook.filter(
      (addrId) => addrId.toString() !== id
    );

    await user.save();

    // delete the address document
    await Address.findByIdAndDelete(id);

    return res.status(200).json({
      success:true,
      message:"Address deleted successfully"
    });

  } catch (error) {
    console.log("Error in deleting address: ", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
};

export const setDefaultAddressController = async (req, res) => {
  try {
    
    const userId = req.user._id;

    const { id: addressId} = req.params;

    // Check if the address exists 
    const address = await Address.findById(addressId);

    if(!address){
      return res.status(404).json({
        success:false,
        message:"Address not found"
      });
    }

    // check the address belongs to the logged in user 
    const user = await User.findById(userId);
    if(!user.addressBook.includes(addressId))
    {
      return res.status(403).json({
        success:false,
        message:"You are not authorized to set this address as default"
      });
    } 

    // update the default address feild 
    user.defaultAddress = addressId;
    await user.save();

    return res.status(200).json({
      success:true,
      message:"Default address set successfully",
      defaultAddress:addressId
    });    

  } catch (error) {
    console.log("Error in setting default address: ", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
}
