import { Router } from "express";
import * as categoryController from "./controller/category.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as Val from "./category.validation.js"
import {asyncHandler} from "../../utils/errorHandling.js"
import subcategoryRouter from '../subcategory/subcategory.router.js'
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";
import { endPoints } from "./category.endPoint.js";
const router = Router()

router.use('/:categoryId/subCategory',subcategoryRouter)

router.route('/')
.post(
    auth(endPoints.categoryCrud),
fileUpload(fileValidation.image).single('image'),
validation(Val.addCategoryVal),
asyncHandler(categoryController.addCategory)
)
.get(validation(Val.searchCategoryVal),
asyncHandler(categoryController.searchByName))

router.route('/:id')
.put(
    auth(endPoints.categoryCrud),
fileUpload(fileValidation.image).single('image'),
validation(Val.updateCategoryVal),
asyncHandler(categoryController.updateCategory))

.delete(
    auth(endPoints.categoryCrud),
validation(idVal),
asyncHandler(categoryController.deleteCategory))

.get( validation(idVal),
    asyncHandler(categoryController.getCategoryByID))


router.get('/get-all-categories',
 asyncHandler(categoryController.getAllCategories))







export default router