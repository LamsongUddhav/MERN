import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {type: String,required: [true, 'Product name is required'],trim: true},

    description: {type: String,required: [true, 'Product description is required']},

    price: {type: Number, required: [true, 'Product price is required'],min: [0, 'Price cannot be negative']},

    category: {type: String, required: true, enum: ['Drones', 'Robotic Arms', 'Sensors', 'Kits', 'Other'] },

    images: [{url: String, public_id: String}],

    features: [String],

    stock: {type: Number,default: 0, min: 0 },
    
    specifications: {weight: String,dimensions: String,power: String,compatibility: [String]}
}, { 
    timestamps: true 
});

const Product = mongoose.model('Product', productSchema);
export default Product;