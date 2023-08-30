import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as productController from "./controller/product.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validation } from "../../middleware/validation.js";
import * as Val from "./product.validation.js";
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router()




router.route('/')
.get(productController.getAllProducts)
.post(
    auth([roles.admin]),
    fileUpload(fileValidation.image).fields([
        {name:'image', maxCount:1},
        {name:'coverImages', maxCount:5}
    ]),
    validation(Val.addProductVal),
    asyncHandler(productController.addProduct)
) 

router.route('/:id')
.delete(
    validation(idVal),
    asyncHandler(productController.deleteProduct))




export default router