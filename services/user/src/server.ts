import connectDB from "./utils/db";
import dotenv from "dotenv";
import express from "express";
import {app} from "./index";

console.log("hit server.ts");


dotenv.config();

connectDB()
.then( () => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`server is running at port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGODB connection failed" , err);
});




