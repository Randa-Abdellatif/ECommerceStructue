import brandModel from "../../../../DB/model/Brand.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import productModel from "../../../../DB/model/Product.model.js"
import { StatusCodes } from "http-status-codes";
import subcategoryModel from "../../../../DB/model/subCategory.model.js";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import { deleteOne } from "../../../utils/hendlers/delete.js";
import QRCode from 'qrcode'
import { pagination } from "../../../utils/pagination.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

export const addProduct = async(req, res, next)=>{
    const isNameExist = await productModel.findOne({name:req.body.name})
    if(isNameExist){
        isNameExist.stock += Number(req.body.quantity) 
        await isNameExist.save()
        return res.status(StatusCodes.ACCEPTED).json({message:"done", isNameExist});
    }
    const isCategoryExist = await categoryModel.findById(req.body.categoryId)
    if(!isCategoryExist){
        return next(new ErrorClass(`Category ${req.body.categoryId} does not exist`,StatusCodes.NOT_FOUND))
    }
    const isSubCategoryExist = await subcategoryModel.findById(req.body.subcategoryId)
    if(!isSubCategoryExist){
        return next(new ErrorClass(`SubCategory ${req.body.subcategoryId} does not exist`,StatusCodes.NOT_FOUND))
    }
    const isBrandExist = await brandModel.findById(req.body.brandId)
    if(!isBrandExist){
        return next(new ErrorClass(`Brand ${req.body.brandId} does not exist`,StatusCodes.NOT_FOUND))
    }
   req.body.slug = slugify(req.body.name)
//    console.log("sizes",typeof(JSON.parse(req.body.sizes))) 
   if(req.body.sizes){req.body.sizes = JSON.parse(req.body.sizes)}
   if(req.body.colors){req.body.colors = JSON.parse(req.body.colors)}
   if(req.body.quantity){req.body.stock = JSON.parse(req.body.quantity)}
   req.body.paymentPrice = req.body.price - (req.body.price * ((req.body.discount || 0) / 100))
   const {secure_url, public_id} = await cloudinary.uploader.upload(req.files.image[0].path, {folder:'E-commerce/product/image'}) 
   req.body.image = {secure_url, public_id}
//    console.log(req.files.coverImages)
   if(req.files.coverImages?.length){
    const coverImages = []
    for(let i = 0 ; i < req.files.coverImages.length ; i++){
        const {secure_url, public_id} = await cloudinary.uploader.upload(req.files.coverImages[i].path, {folder:'E-commerce/product/coverImage'})
        coverImages.push({secure_url, public_id})
    }
    req.body.coverImages = coverImages
   }
    req.body.QRCode = await QRCode.toDataURL( JSON.stringify({
        name:req.body.name,
        description:req.body.description,
        imgUrl: req.body.secure_url,
        price:req.body.price,
        paymentPrice:req.body.paymentPrice
    })
    //,function (err, url) {
    // console.log(url)}
    )
//    console.log(req.body)
req.body.createdby = req.user._id;
   const product = await productModel.create(req.body)
   res.status(StatusCodes.CREATED).json({message:"done", product})
}

export const deleteProduct = deleteOne(productModel)

// export const getAllProducts = async(req, res, next) => {
//     const {page, size} = req.query
//     const {limit, skip }=pagination(page,size)
//     const excluded = ['sort', 'page','size','fields','searchKey']
//     let queryFields = {...req.query}
//     excluded.forEach(ele => {
//         delete queryFields[ele]
//     })
//     queryFields = JSON.stringify(queryFields).replace(/lte|lt|gte|gt/g,(match)=>{
//         return `$${match}`
//     })
//     queryFields = JSON.parse(queryFields)
//     let reqQuery = productModel.find(queryFields)
//     reqQuery.skip(skip).limit(limit)
//     reqQuery.sort(req.query.sort.replace(/,/g,' '))
//     reqQuery.find({$or:[
//         {name:{$regex:req.query.searchKey}}, {description:{$regex:req.query.searchKey}}
//     ]}
//         )
//     reqQuery.select(req.query.fields.replace(/,/g,' '))
//     const products = await reqQuery
//     return res.status(StatusCodes.ACCEPTED).json({message:'done', products})

// }

export const getAllProducts = async(req, res, next) => {
    const apiFeatures = new ApiFeatures(productModel.find(),req.query).pagination(productModel).filter().search().select().sort()
    const products = await apiFeatures.mongooseQuery

    return res.status(StatusCodes.ACCEPTED).json({message:'done',products})
}