import { StatusCodes } from "http-status-codes";
import productModel from "../../../../DB/model/Product.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const addToCart = async(req, res, next) => {
    const { productId, quantity } = req.body;
    const product = await productModel.findById(productId)
    if(!product){
        return next(new ErrorClass(`product not found`, StatusCodes.NOT_FOUND))
    }
    if(product.stock < quantity){
        await productModel.updateOne({_id:product},{
            $addToSet:{
                wishList: req.user._id
            }
        })
        return next(new ErrorClass('out of stock', StatusCodes.BAD_REQUEST))
    }
    const cart = await cartModel.findOne({userId:req.user._id})

    const productIndex = cart.products.findIndex((product => {
        return product.product == productId
    }))
    if(productIndex == -1){
        cart.products.push({
            product:productId,
            quantity
        })
    } else {
        cart.products[productIndex].quantity = quantity
    }
    // const exist = false
    // for (let i = 0; i < cart.products.length; i++) {
    //     if(cart.products[i].product.toString() == productId){
    //         cart.products[i].quantity = quantity;
    //         exist = true
    //         break;
    //     }
    // }
    // if(!exist){
    //     cart.products.push({
    //         product:productId,
    //         quantity
    //     })
    // }
    await cart.save()
    return res.status(StatusCodes.CREATED).json({message:'done', cart})
}

export const deleteFromCart = async(req, res, next) => {
    const {id} = req.params
    const product = await cartModel.findOne({
        userId:req.user._id,
        'products.product':id
    })
    if (!product) {
        return next(new ErrorClass('product not found', StatusCodes.NOT_FOUND))
    }
    const cart = await cartModel.updateOne({userId:req.user._id},
        {
           $pull:{products:{product:id}} 
        })
        return res.status(StatusCodes.ACCEPTED).json({message:"done"})
}

export const getUserCart = async(req, res, next) => {
    const userId = req.user._id
    const cart = await cartModel.findOne({userId}).populate([{
        path:'products.product',
        select:'price name paymentPrice image description',
        populate:[
            {
                path:'categoryId',
                select:'name'
            },
            {
                path:'subcategoryId',
                select:'name'
            },
            {
                path:'brandId',
                select:'name'
            },
        ]
    }])
    let totalPrice = 0
    cart.products = cart.products.filter(ele => {
        if(ele?.product){
            totalPrice += (ele.product.paymentPrice * ele.quantity)
            return ele
        }
    })

    await cart.save()
    return res.json({cart, totalPrice})
}