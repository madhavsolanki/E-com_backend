import express from "express";
import isUserAuthenticated from "../middlewares/auth.middleware.js";
import {
  addNewNewAddressController,
  deleteAddressController,
  getAddressById,
  getAllUserAddressController,
  setDefaultAddressController,
  updateAddressController,
} from "../controllers/address.controller.js";

const router = express.Router();

router.post("/add", isUserAuthenticated, addNewNewAddressController);

router.get("/all", isUserAuthenticated, getAllUserAddressController);

router.get("/:id", isUserAuthenticated, getAddressById);

router.put("/update/:id", isUserAuthenticated, updateAddressController);

router.delete("/delete/:id", isUserAuthenticated, deleteAddressController);

router.put("/set-default/:id", isUserAuthenticated, setDefaultAddressController);




export default router;
