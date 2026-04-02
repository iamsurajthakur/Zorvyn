import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import env from "./src/config/env.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`Server running at port ${env.PORT}`);
    });

    const gracefulShutdown = async () => {
        console.log("Shutting down...");

        await new Promise((resolve) => server.close(resolve));
        console.log("HTTP server closed");

        await mongoose.connection.close();
        console.log("MongoDB connection closed");

        process.exit(0);
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();