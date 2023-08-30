import couponModel from "../../../../DB/model/Coupon.model.js"
import { ErrorClass } from "../../../utils/errorClass.js"

export const createCoupon = async (req, res, next) => {
    const {code, amount, expireDate, numOfUses} = req.body
    const isCouponExist = await couponModel.findOne({code})
    if(isCouponExist){
        return next (new ErrorClass(`${code} already exist`))
    }

    const coupon = await couponModel.create({
        code, amount, expireDate, numOfUses,
        createdBy:req.user._id
    })

    return res.status(201).json({message:"done",coupon})
}