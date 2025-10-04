"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose_1.default.connect(process.env.MONGO_URI, {
            dbName: "blog"
        });
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.log("Error connecting to MongoDB ", error);
        process.exit(1);
    }
};
exports.default = connectDB;
