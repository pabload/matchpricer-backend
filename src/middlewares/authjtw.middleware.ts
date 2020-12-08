import { Response, Request, NextFunction } from 'express'
import Jwt from 'jsonwebtoken'
import config from '../config'
import User from '../models/users.model'
export const verifyToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        console.log('token:'+token);
        if (!token) { return res.status(403).json({
             status:'error',
             message: 'Token not provided'
             }) }
        const decoded:any = Jwt.verify(token, config.SECRETTOKEN);
        const user = User.findById(decoded.id);
        if(!user){return res.status(404).json({
            status: 'error',
            message:'User not found'
        })}
        next();
    } catch (error) {
       res.status(404).json({message:'ERROR ON SERVER: token malformed'});
       console.log(error);
    }
}