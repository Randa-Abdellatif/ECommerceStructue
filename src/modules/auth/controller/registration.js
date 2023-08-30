import { StatusCodes } from "http-status-codes";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import CryptoJS from "crypto-js";
import chalk from "chalk";
import { hash, compare } from "../../../utils/HashAndCompare.js";
import cloudinary from "../../../utils/cloudinary.js";
import sendEmail, { createHtml } from "../../../utils/email.js";
import { nanoid } from "nanoid";
import { generateToken } from "../../../utils/GenerateAndVerifyToken.js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const signUp = async(req, res, next) => {
    let { email, password, phone, DOB} = req.body;
    const isEmailExist = await userModel.findOne({email:req.body.email})
    if(isEmailExist){
        return next (new ErrorClass(`this email '${req.body.email}' already exists`, StatusCodes.CONFLICT))
    }
    req.body.phone = CryptoJS.AES.encrypt(req.body.phone , process.env.ENCRYPTION_KEY).toString();
    req.body.password = hash(req.body.password)
    // console.log(chalk.cyanBright(password))
    if(req.file){
        const {public_id, secure_url} = await cloudinary.uploader.upload(req.file.path,{folder:'E-commerce/user'})
        req.body.image = { public_id, secure_url }
    }

    const code = nanoid(6)
    const html = createHtml(code)
    sendEmail({to:req.body.email, subject:"confirm email", html })
    req.body.code = code
    const user = await userModel.create(req.body)
    await cartModel.create({userId:user._id})
    res.status(StatusCodes.CREATED).json({message :"done", user})

}

export const confirmEmail = async(req, res, next) => {
    const {email, code} = req.body
    const isEmailExist = await userModel.findOne({email})
    if(!isEmailExist){
        return next ( new  ErrorClass(`email not found` , StatusCodes.NOT_FOUND))
    }
    if (code != isEmailExist.code) {
        return next(new ErrorClass('in-valid code', StatusCodes.BAD_REQUEST))
    }
    const newCode = nanoid(6)
    const confirmUser = await userModel.updateOne({email},{confirmEmail:true, code:newCode})
    res.status(StatusCodes.OK).json({message:"done", confirmUser})
}

export const signIn = async(req, res, next) => {
    const {email, password} = req.body
    const user = await userModel.findOne({email})
    if(!user){
        return next(new ErrorClass(`in valid user information`, StatusCodes.NOT_ACCEPTABLE))
    }
    const match = compare(password, user.password)
    if(!match){
        return next(new ErrorClass(`in valid user information`, StatusCodes.NOT_ACCEPTABLE))
    }
    const payload = {
        id:user._id,
        email: user.email
    }
    const token = generateToken({payload})

    return res.status(StatusCodes.ACCEPTED).json({message:"done", token})
}

export const sendCode = async(req, res, next) =>{
    const {email} = req.body;
    const user = await userModel.findOne({email})
    if(!user){
        return next(new ErrorClass(`user not found`, StatusCodes.NOT_FOUND))
    }
    const code = nanoid(6)
    const html = createHtml(code)
    sendEmail({to:req.body.email, subject:"forget password", html})
    await userModel.updateOne({email},{code})
    return res.status(StatusCodes.ACCEPTED).json({message:"done"})
}

export const resetPass = async(req, res, next) => {
    let {email, code, password} = req.body;
    const user = await userModel.findOne({email})
    if(!user){
        return next(new ErrorClass(`user not found`, StatusCodes.NOT_FOUND))
    }
    if(code != user.code){
        return next(new ErrorClass(`in-valid code`, StatusCodes.BAD_REQUEST))
    }

    password = hash(password)
    const newCode = nanoid(6)
    await userModel.updateOne({email},{password,code:newCode})
    return res.json({message:"done"})
}