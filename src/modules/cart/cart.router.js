import { Router } from "express";
import auth, { roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as cartController from "./controller/cart.js";
const router = Router()




router.route('/')
.get( 
    auth([roles.user]),
    cartController.getUserCart
)
.post(
    auth([roles.user]),
    asyncHandler(cartController.addToCart)
)

router.route('/:id')
.delete(auth([roles.user]),
    asyncHandler(cartController.deleteFromCart))


export default router