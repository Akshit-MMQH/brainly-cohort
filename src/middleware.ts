import type { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";


export const Auth = (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.token
    const decodedData = Jwt.verify(token as string, JWT_SECRET)
    if(decodedData) {
        //@ts-ignore
        req.userId = decodedData.id;
        next()
    } else{
        res.status(403).json({
            msg: "Not Logged in Bro !!"
        })
    }

} 
