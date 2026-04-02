import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })

        console.log(`MongoDB connected: ${connectionInstance.connection.host}`)

        mongoose.connection.on('connected',() => {
             console.log('MongoDB connection established')
        })

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected')
        })

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB error: ',err)
        })

    } catch (error) {
        console.error('mongoDB connection failed: ', error.message)
        process.exit(1)
    }
}

export default connectDB