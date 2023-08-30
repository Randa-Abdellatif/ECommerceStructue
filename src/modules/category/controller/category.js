import slugify from "slugify";
import cloudinary from './../../../utils/cloudinary.js'
import categoryModel from './../../../../DB/model/Category.model.js'
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import { deleteOne } from "../../../utils/hendlers/delete.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { ErrorClass } from "../../../utils/errorClass.js";


export const addCategory = async (req, res, next) => {
    let {name} = req.body;
    const userId = req.user._id
    name = name.toLowerCase()
    const isExist = await categoryModel.findOne({name})
    if(isExist){
        return next(new ErrorClass("This name already exists",StatusCodes.CONFLICT))
    }
    const slug = slugify(name)
    // console.log({slug ,name, file:req.file})
    const {secure_url, public_id}= await cloudinary.uploader.upload(req.file.path,{folder:'E-commerce/category'})
    const category = await categoryModel.create({name,slug,image:{secure_url, public_id},
      createdBy:userId
    })
    res.status(StatusCodes.CREATED).json({message:"Done",category,status:ReasonPhrases.CREATED})
    
}

export const updateCategory = async(req, res, next) => {
    const {id} = req.params
     
      const isExist = await categoryModel.findById(id)
      if(!isExist){
        return next(new Error('category not found'))
      }
      if(req.body.name){
        req.body.name = req.body.name.toLowerCase()
        const nameExist = await categoryModel.findOne({name:req.body.name, _id:{$ne:id}})
        if(nameExist){
          return next(new Error('name already exists'))
        }
        req.body.slug = slugify(req.body.name)
      }
     
      if(req.file){
        const { secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{folder:'E-commerce/category'})
        await cloudinary.uploader.destroy(isExist.image.public_id)
        req.body.image = { secure_url, public_id}
      }
      const updatedCategory = await categoryModel.updateOne({id:id}, req.body) 
      return res.status(StatusCodes.ACCEPTED).json({message:'done',updatedCategory})
}

// export const deleteCategory =deleteOne(categoryModel)
export const deleteCategory = async(req, res, next) => {
       const {id} = req.params
       const isExist = await categoryModel.findByIdAndDelete(id)
       if(!isExist){
         return next(new Error('category not found'))
       }
       await cloudinary.uploader.destroy(isExist.image.public_id)
       return res.status(StatusCodes.ACCEPTED).json({message:'done',isExist})
 }

 export const searchByName = async(req, res, next) => {
    const {searchKey} = req.query
    const categories = await categoryModel.find({
        name:{
            $regex:`${searchKey}`
        }
    })
    res.json({categories})
 } 

 export const getAllCategories = async(req, res, next) => {
  const mongooseQuery =  categoryModel.find({}).populate([{
    path:'subcategories'
  }])
  // let productCount ;
  //  categoryModel.count(function(err, result) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     productCount=  result;
  //   }
  // })
  const api = new ApiFeatures(mongooseQuery, req.query)
  .pagination(categoryModel)
  .sort().filter().search().select()
  const categories = await api.mongooseQuery
  res.json({categories,
    productCount:api.queryData.count ,
    totalPages:api.queryData.totalPages,
    page:api.queryData.page,
    next:api.queryData.next,
    previous:api.queryData.previous
  })
 }

 //4-get Category By ID
 export const getCategoryByID = async(req, res, next) => {
  const {id} = req.params
  const categories = await categoryModel.findById(id).populate([{
    path:'subcategories'
  }])
  res.json({categories})
 }