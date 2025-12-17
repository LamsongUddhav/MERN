import Product from '../models/product.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

// Create product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, features, stock, specifications } = req.body;
        
        // Upload images to Cloudinary
        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'robotics_products'
                    });
                    
                    uploadedImages.push({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                    
                    // Delete temp file
                    await fs.unlink(file.path);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                }
            }
        }

        // Parse features and specifications
        const featureArray = features ? 
            (Array.isArray(features) ? features : features.split(',').map(f => f.trim())) : 
            [];
        
        const specs = specifications ? 
            (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : 
            {};

        // Create product
        const product = new Product({
            name,
            description,
            price: Number(price),
            category,
            images: uploadedImages,
            features: featureArray,
            stock: Number(stock) || 0,
            specifications: specs
        });

        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: savedProduct
        });

    } catch (error) {
        console.error('Create product error:', error);
        
        // Clean up uploaded images on error
        if (req.files) {
            for (const file of req.files) {
                try {
                    await fs.unlink(file.path);
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updates = { ...req.body };
        
        // Handle image updates
        if (req.files && req.files.length > 0) {
            const newImages = [];
            
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'robotics_products'
                    });
                    
                    newImages.push({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                    
                    await fs.unlink(file.path);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                }
            }
            
            // Keep old images or replace
            if (req.body.keepOldImages === 'true') {
                updates.images = [...product.images, ...newImages];
            } else {
                // Delete old images
                for (const image of product.images) {
                    try {
                        await cloudinary.uploader.destroy(image.public_id);
                    } catch (deleteError) {
                        console.error('Delete image error:', deleteError);
                    }
                }
                updates.images = newImages;
            }
        }

        // Parse specifications if string
        if (updates.specifications && typeof updates.specifications === 'string') {
            updates.specifications = JSON.parse(updates.specifications);
        }
        
        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete images from Cloudinary
        if (product.images.length > 0) {
            for (const image of product.images) {
                try {
                    await cloudinary.uploader.destroy(image.public_id);
                } catch (deleteError) {
                    console.error('Delete image error:', deleteError);
                }
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};
