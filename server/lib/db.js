import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("✅ Database Connected"));
        mongoose.connection.on('error', (err) => console.error("❌ DB Error:", err));
        
        await mongoose.connect(`${process.env.MONGO_URI}`);
    } catch (error) {
        console.error("❌ Error while connecting to database:", error.message);
        process.exit(1); // 🆕 Exit if DB fails
    }
};