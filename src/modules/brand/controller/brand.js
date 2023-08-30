import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../../utils/errorClass.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

export const addBrand = async(req, res, next) => {
    let {name} = req.body;
    const userId = req.user._id;
    name = name.toLowerCase();
    const isExist =  await brandModel.findOne({name})
    if(isExist){
        return next(new Error(`Brand ${name} already exists`))
    }
    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{folder:'E-commerce/brand'})
    const brand = await brandModel.create({
        name,
        slug:slugify(name),
        image:{secure_url, public_id},
        createdBy:userId
    })
    return res.status(StatusCodes.CREATED).json({message:"Done",brand})
}

export const deleteBrand = async(req, res, next) => {
    const {id} = req.params;
    const isExist = await brandModel.findByIdAndDelete(id)
    if(isExist){
        return next(new ErrorClass('Brand not found', StatusCodes.NOT_FOUND))
    }
    await cloudinary.uploader.destroy(isExist.image.public_id)
    return res.status(StatusCodes.ACCEPTED).json({message:"done", result:isExist})
}

export const updateBrand = async(req, res, next) => {
    const {id} = req.params
    const isExist =await brandModel.findById(id)
    if(!isExist){
        return next(new ErrorClass('Brand not found', StatusCodes.NOT_FOUND))
    }
    if(req.body.name){
        const nameExist = await brandModel.findOne({name:req.body.name, _id:{$ne:id}})
        if(nameExist){
            return next(new ErrorClass('name already exists', StatusCodes.CONFLICT))
        }
        req.body.slug = slugify(req.body.name)
    }
    if(req.file){
        const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path, {folder:'brand'})
        await cloudinary.uploader.destroy(isExist.image.public_id)
        req.body.image = {secure_url, public_id}
    }
    const updatedBrand = await brandModel.updateOne({_id:id},req.body)
    return res.status(StatusCodes.ACCEPTED).json({message:"done", updatedBrand})
}

export const getBrandById = async(req, res, next) => {
    const brand = await brandModel.findById(req.params.id)
    if(!brand) {
        return next(new ErrorClass("not found", StatusCodes.NOT_FOUND))
    }
    return res.status(StatusCodes.ACCEPTED).json({message:"done", brand})
}

export const getAllBrands = async(req, res, next) => {
    const mongooseQuery = brandModel.find()
    const api = new ApiFeatures(mongooseQuery, req.query).pagination().sort().filter().search().select()
    const brand = await api.mongooseQuery
    return res.status(StatusCodes.ACCEPTED).json({message:"done", brand})
}