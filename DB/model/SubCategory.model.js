import { model, Schema, Types } from 'mongoose';


const subcategorySchema = new Schema({
    name: { type: String, required: true, unique:true ,lowercase: true},
    slug: { type: String, required: true, unique:true ,lowercase: true},
    image: { type: Object },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },

}, {
    timestamps: true
})

const subcategoryModel = model('SubCategory', subcategorySchema)

export default subcategoryModel