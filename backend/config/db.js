import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://anjilamagar506_db_user:Anjila.@cluster0.j56riod.mongodb.net/robotics_store?retryWrites=true&w=majority');
        console.log(" MongoDB Connected Successfully");
    } catch (error) {
        console.error(" MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

export default connectDB;