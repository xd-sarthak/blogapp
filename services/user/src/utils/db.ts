import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI as string,{
            dbName: "blog"
        });
    
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB ",error);
        process.exit(1);
    }
};

export default connectDB;