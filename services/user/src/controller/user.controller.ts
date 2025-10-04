import TryCatch from "../utils/TryCatch";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const loginUser = TryCatch(async (req,res) =>{
    const {email,name,image} = req.body;

    let user = await User.findOne({email});

    if(!user){
        user = await User.create({name,email,image});
    }

    const token = jwt.sign({user},process.env.JWT_SECRET as string,{
        expiresIn:"5d"
    });

    res.status(200).json({
        message: "Login Success",
        token,
        user
    });
});