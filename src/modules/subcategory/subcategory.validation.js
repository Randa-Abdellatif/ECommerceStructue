import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const addSubCategoryVal = {
    body: joi.object().required().keys({
        name: generalFields.name,
        categoryId:generalFields.id
    }),
    file: generalFields.file.required(),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}

export const updateSubCategoryVal = {
    body: joi.object().required().keys({
        name: generalFields.name,
        categoryId:generalFields.id
    }),
    file: generalFields.file,
    params: joi.object().required().keys({
        id:generalFields.id
    }),
    query: joi.object().required().keys({})
}


// export const deleteSubCategoryVal = {
//     body: joi.object().required().keys({}),
//     params: joi.object().required().keys({
//         id:generalFields.id
//     }),
//     query: joi.object().required().keys({})
// }

export const searchSubCategoryVal = {
    body: joi.object().required().keys({}),
    file: generalFields.file,
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        searchKey:generalFields.name
    })
}
