import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import connectDB from './config/db.js';
import productRoutes from './rote/productRoute.js';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Create uploads directory
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Connect to database
connectDB();

// Routes
app.use('/api/products', productRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🤖 Robotics Store API',
        version: '1.0.0',
        endpoints: {
            products: {
                getAll: 'GET /api/products',
                getOne: 'GET /api/products/:id',
                create: 'POST /api/products',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id'
            }
        }
    });
});

// FIX: 404 handler - REMOVE THE '*' or use 'all'
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    
    // Handle specific errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value'
        });
    }
    
    if (err.message.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    // Default error
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 50000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Uploads directory: ${uploadsDir}`);
    console.log(` API Base: http://localhost:${PORT}/api/products`);
});