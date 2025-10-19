import { NextFunction,Request,Response } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import { IUser } from "../models/User";

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async(
    req:AuthenticatedRequest,
    res:Response,
    next:NextFunction) : Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if(!authHeader || !authHeader.startsWith("Bearer ")){
                res.status(401).json({
                    message: "Please login, auth header error not found"
                });
                return;
            }

            const token = authHeader.split(" ")[1];

            if(!token || token.trim().length === 0){
                res.status(401).json({
                    message: "Invalid token format"
                });
                return;
            }

            const decodedValue = jwt.verify(token,
                process.env.JWT_SECRET as string,
            ) as JwtPayload;

            if(!decodedValue || !decodedValue.user){
                res.status(401).json({
                    message: "Invalid token"
                });
                return;
            }

            req.user = decodedValue.user;
            next();

        } catch (error) {
            console.error("JWT Verification error: ", error);
            
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    message: "Token expired, please login again",
                });
            } else if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({
                    message: "Invalid token, please login again",
                });
            } else {
                res.status(401).json({
                    message: "Please Login: JWT error",
                });
            }
        }
    }