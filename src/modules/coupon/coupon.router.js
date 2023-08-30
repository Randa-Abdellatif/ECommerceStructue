import { Router } from "express";
import * as couponController from "./controller/coupon.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router()




router.route('/')
.post(
    auth([roles.admin]),
    asyncHandler(couponController.createCoupon)
)




export default router