import dotenv from "dotenv";
dotenv.config();
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) =>{

    const token = req.headers["authorization"];
    const decodedtoken = jwt.verify(token as string, process.env.JWTPASS as string) as JwtPayload;

    if(decodedtoken){
        req.userId = decodedtoken.ID;
        next();
    }else{
        res.status(403).json({ warning : "you are not logged in"});
    }
};