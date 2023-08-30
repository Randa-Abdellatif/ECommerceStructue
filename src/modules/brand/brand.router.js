import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as Val from './brand.validation.js'
import * as brandController from './controller/brand.js'
import { asyncHandler } from "../../utils/errorHandling.js";
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router()




router.route('/')

.post(
    auth([roles.admin]),
fileUpload(fileValidation.image).single('image'),
validation(Val.addBrandVal),
asyncHandler(brandController.addBrand)
)

.get(
    asyncHandler(brandController.getAllBrands)
)


router.route("/:id")
.put(
    auth([roles.admin]),

    fileUpload(fileValidation.image).single('image'),
    validation(Val.updateBrandVal),
    asyncHandler(brandController.updateBrand)
)

.delete(
    auth([roles.admin]),
    validation(idVal),
    asyncHandler(brandController.deleteBrand)
)

.get(
    validation(idVal),
    asyncHandler(brandController.getBrandById)
)




export default router