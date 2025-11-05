"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./utils/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = require("./index");
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
(0, db_1.default)()
    .then(() => {
    index_1.app.listen(process.env.PORT || 5000, () => {
        console.log(`server is running at port ${process.env.PORT}`);
    });
})
    .catch((err) => {
    console.log("MONGODB connection failed", err);
});
