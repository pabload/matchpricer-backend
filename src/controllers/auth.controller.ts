import { Response, Request,NextFunction } from 'express'
import User from '../models/users.model'
import * as encryptValidator from '../validations/encryptpass.validations'
import * as userValidator from '../validations/user.validations'
import Config from '../config'
import Jwt from 'jsonwebtoken'
export const singUp = async (req:Request, res:Response)=>{
    try {
        const {username,email,password} = req.body
        if(await userValidator.UserNameFound(username)){return res.status(404).json({
            status:'error',
            message:'username is already used'
        })}
        if(await userValidator.emailFound(email)){return res.status(400).json({
            status:'error',
            message:'email is already used'
        })}
        const newUser=new User ({
           username,
           email,
           password:await encryptValidator.encryptPassword(password),
           productsontrack:[]
        });
        await newUser.save();
        const token =Jwt.sign({id:newUser.id},Config.SECRETTOKEN,{expiresIn:86400});
        res.status(200).json({
            status:'success',
            message:'user saved',
            token
        });
    } catch (error) {
        res.status(404).json('ERROR: '+error);
    }
}
export const singIn = async (req:Request, res:Response)=>{
  try {
    const {email,password} = req.body
    const emailFound:boolean = await userValidator.emailFound(email);
    if(!emailFound){return res.status(401).json({
        status:'error',
        message:'email not found'
    })}
    const userFound:any = await User.findOne({email:email});
    const matchPassword = await encryptValidator.comparePasswords(password,userFound.password);
    if(!matchPassword){return res.status(401).json({
        status:'error',
        message:'password is not correct'
    });}
    const token =Jwt.sign({id:userFound._id},Config.SECRETTOKEN,{expiresIn:86400});
    res.status(200).json({
        status:'success',
        message:'user logged',
        token
    });  
  } catch (error) {
    res.status(404).json('ERROR: '+error);
  }
}
