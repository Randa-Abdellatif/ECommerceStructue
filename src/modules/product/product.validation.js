import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addProductVal = {
    body: joi.object().required().keys({
        name: generalFields.name,
        description:generalFields.name.min(50),
        quantity:joi.number().min(1).positive().required(),
        price:joi.number().min(0).positive().required(),
        discount:joi.number().min(0).max(100),
        colors:joi.custom((value,helper)=>{
            if(value){
                value = JSON.parse(value);
                const ArrayValidationSchema = joi.object({
                    value:joi.array().items(joi.string())
                })
                const ValRes = ArrayValidationSchema.validate({value},{abortEarly:false})
                if(ValRes.error){return helper.message = "invalid value of sizes"}
                else {return true}
            }
        }),
        sizes:joi.custom((value,helper)=>{
            if(value){
                value = JSON.parse(value);
                const ArrayValidationSchema = joi.object({
                    value:joi.array().items(joi.string().alphanum())
                })
                const ValRes = ArrayValidationSchema.validate({value},{abortEarly:false})
                if(ValRes.error){return helper.message = "invalid value of sizes"}
                else {return true}
            }
        }),
// sizes:joi.array().items(joi.number()),
        categoryId:generalFields.id,
        subcategoryId:generalFields.id,
        brandId:generalFields.id,
    }),
    files: joi.object().required().keys({
        image:joi.array().items(generalFields.file).length(1).required(),
        coverImages:joi.array().items(generalFields.file).length(5)

    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}