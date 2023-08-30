import { StatusCodes, ReasonPhrases } from "http-status-codes"
import { ErrorClass } from "../errorClass.js"
import cloudinary from "../cloudinary.js"

export const deleteOne = (model) => {
    return async(req, res, next) => {
        const {id} = req.params
        const isExist = await model.findByIdAndDelete(id)
        if(!isExist){
          return next(new ErrorClass('category not found', StatusCodes.NOT_FOUND))
        }
        if(isExist.image){
            await cloudinary.uploader.destroy(isExist.image.public_id)
        }
        if(isExist.coverImages){
            for (let index = 0; index < isExist.coverImages.length; index++) {
                await cloudinary.uploader.destroy(isExist.coverImages[index].public_id) 
            }
            
        }
        
        return res.status(StatusCodes.OK).json({message:'done', status:ReasonPhrases.OK})
  }
}