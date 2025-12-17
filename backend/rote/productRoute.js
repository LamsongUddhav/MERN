import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controller/productController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/products - Create product with images
router.post('/', upload.array('images', 5), createProduct);

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product
router.get('/:id', getProductById);

// PUT /api/products/:id - Update product
router.put('/:id', upload.array('images', 5), updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

export default router;