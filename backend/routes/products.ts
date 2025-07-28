import express from "express";
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../controllers/products";

const router = express.Router();


router.route("/").get(getAllProducts).post(addProduct);
router.route("/:id").put(updateProduct).delete(deleteProduct);

export default router; 