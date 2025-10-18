import express from "express";
import cors from "cors";
import userRoute from "./routes/user.route";



const app = express();


app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",  // Allow all origins for testing
    credentials: true
}));

console.log("hit index.ts");


app.use("/api/v1",userRoute);

app.get("/health-route",(req,res) =>{
    res.json({message:"ok"});
});

export {app};