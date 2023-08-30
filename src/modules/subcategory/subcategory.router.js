import { Router } from "express";
import * as subcategoryController from "./controller/subcatogery.js";
import{fileUpload, fileValidation} from '../../utils/multer.js'
import { validation } from "../../middleware/validation.js";
import * as Val  from "./subcategory.validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router({mergeParams:true})

router.route('/')
.get(subcategoryController.getAllSubcategories)

.post(
    auth([roles.admin]),
fileUpload(fileValidation.image).single('image'),
validation(Val.addSubCategoryVal),
asyncHandler( subcategoryController.addSubcategory))

router.route('/:id')
.put(
    auth([roles.admin]),
fileUpload(fileValidation.image).single('image'),
validation(Val.updateSubCategoryVal),
asyncHandler(subcategoryController.updateSubCategory)
)

.delete(
validation(idVal),
asyncHandler(subcategoryController.deleteSubCategory)
)
.get( 
    validation(idVal),
    asyncHandler(subcategoryController.getSubCategoryByID)
    )

router.get('/search',
validation(Val.searchSubCategoryVal),
asyncHandler(subcategoryController.search)
)








export default router