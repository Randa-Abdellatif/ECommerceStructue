import slugify from "slugify"
import categoryModel from "../../../../DB/model/Category.model.js"
import subcategoryModel from "../../../../DB/model/subCategory.model.js"
import cloudinary from "../../../utils/cloudinary.js"
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import { ErrorClass } from "../../../utils/errorClass.js";

export const addSubcategory = async(req, res, next) => {
    let {name, categoryId } = req.body
    const userId = req.user._id
    const categoryExist = await categoryModel.findById(categoryId)
    if(!categoryExist){
        return next (new ErrorClass('could not find category',StatusCodes.NOT_FOUND))
    }
    const nameExist = await subcategoryModel.findOne({name})
    if(nameExist){
        return next(new ErrorClass('name already exists',StatusCodes.CONFLICT))
    }
    const {secure_url, public_id}= await cloudinary.uploader.upload(req.file.path,{folder:'E-commerce/subcategory'})
    const subcategory = await subcategoryModel.create({name,slug:slugify(name),categoryId,
    image:{secure_url, public_id},
    createdBy:userId
})
    res.status(StatusCodes.CREATED).json({message:"Done",subcategory})
}

export const getAllSubcategories = async (req, res, next) => {
    console.log(req.params)
    const subCategories = await subcategoryModel.find(req.params)
    .populate([{path:'categoryId'}])
    res.json(subCategories)
}

//7-update Subcategory
export const updateSubCategory = async(req, res, next) => {
    const {id} = req.params
    const isExist = await subcategoryModel.findById(id)
    if(!isExist){
        return next(new ErrorClass('subcategory not found',StatusCodes.NOT_FOUND))
    }
    if(req.body.name){
        const nameExist = await subcategoryModel.findOne({name:req.body.name, _id:{$ne:id}})
    if(nameExist){
        return next(new ErrorClass('name already exist',StatusCodes.CONFLICT))
    }
    req.body.slug = slugify(req.body.name)
    }
    if(req.file){
        const { secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{folder:'E-commerce/subcategory'})
        await cloudinary.uploader.destroy(isExist.image.public_id)
        req.body.image = { secure_url, public_id}
    }
    const updateSub = await subcategoryModel.updateOne({_id:id},req.body)
    return res.status(StatusCodes.ACCEPTED).json({message:"Done",updateSub})
}

//8-delete Subcategory
export const deleteSubCategory = async (req, res, next) => {
    const {id} = req.params
    const isExist = await subcategoryModel.findByIdAndDelete(id)
    if(!isExist){
        return next(new ErrorClass('subcategory not found', StatusCodes.NOT_FOUND))
    }
    await cloudinary.uploader.destroy(isExist.image.public_id)
    return res.status(StatusCodes.ACCEPTED).json({message:"deleted"})

}

//9-search Subcategory
export const search = async(req, res, next) => {
    const {searchKey} = req.query
    const category = await subcategoryModel.find({name:{$regex:`${searchKey}`}})
    res.json({category})
}

//10-get Subcategory by id
export const getSubCategoryByID = async(req, res, next) => {
    const {id} = req.params
    const isExist = await subcategoryModel.findById(id)
    if(!isExist){
        return next(new ErrorClass('subcategory not found', StatusCodes.NOT_FOUND))
    }
    return res.status(StatusCodes.ACCEPTED).json({message:"done" ,result:isExist})
   }

