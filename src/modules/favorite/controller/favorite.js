import productModel from "../../../../DB/model/Product.model.js"
import userModel from "../../../../DB/model/User.model.js"
import { ErrorClass } from "../../../utils/errorClass.js"

export const addToWishList = async (req, res, next) => {
    const productId = req.params.id
    const product = await productModel.findById(productId)
    if(!product){
        return next(new ErrorClass('product not found', 404))
    }
    const user = await userModel.updateOne({_id:req.user._id}, {
        $addToSet:{
            favorites:productId
        }
    })
    return res.json({message:"done", user})
}

export const getUserWishList = async(req, res, next) => {
    const userId = req.user._id
    const user = await userModel.findById(userId).populate([{
        path: 'favorites'
    }])
    // user.favorites = user.favorites.filter(product => {})
    return res.json({message:'done', user})
}