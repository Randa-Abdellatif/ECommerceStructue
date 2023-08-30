import { Router } from "express";
import * as authController from "./controller/registration.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
const router = Router()

router.post('/signup',
fileUpload(fileValidation.image).single('image'),
authController.signUp)

router.patch('/confirm-email',
authController.confirmEmail)

router.post('/signin', authController.signIn)

router.patch('/send-code', authController.sendCode)

router.patch('/reset-pass',authController.resetPass)


export default router