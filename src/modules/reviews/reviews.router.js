import { Router } from "express";
import auth, { roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as RC from "./controller/review.js";
const router = Router()




router.route('/')
.post(
    auth([roles.user]),
    asyncHandler(RC.addReview)
)

router.route('/:id')
.put(
    auth([roles.user]),
    asyncHandler(RC.updateReview)
)
.delete(
    auth([roles.user]),
    asyncHandler(RC.deleteReview)
)




export default router