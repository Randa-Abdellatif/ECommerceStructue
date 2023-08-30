import { Router } from "express";
import auth, { roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as wishController from "./controller/favorite.js";
const router = Router()




router.route('/')
.get(
    auth([roles.user]),
    asyncHandler(wishController.getUserWishList)
)


router.route('/:id')
.patch(
    auth([roles.user]),
    asyncHandler(wishController.addToWishList)
)


export default router