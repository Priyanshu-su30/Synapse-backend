import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import ts from "typescript";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_PASSWORD)
    if (decoded) {
        if (typeof decoded === "string") {
            res.status(403).json({
                message: "You are not logged in"
            })
            return;    
        }
        //@ts-ignore
        req.userId = (decoded as JwtPayload).id;
        next()
    } else {
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}



// import { NextFunction, Request, Response } from 'express';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { JWT_PASSWORD } from './config';

// declare global {
//   namespace Express {
//     interface Request {
//       userId?: string;
//     }
//   }
// }

// export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const header = req.headers['authorization'];

//   try {
//     const decoded = jwt.verify(header as string, JWT_PASSWORD) as JwtPayload;
//     req.userId = decoded.id;
//     next();
//   } catch (error) {
//     res.status(403).json({
//       message: 'You are not logged in',
//     });
//   }
// };