import { model, Schema, Types } from 'mongoose';


const couponSchema = new Schema({
    code: { type: String, required: true, unique:true ,lowercase: true},
    amount: { type: Number, required: true, min:0, max:100 },
    expireDate: { type: Date, required:true, min:Date.now() },
    numOfUses: Number,
    usedBy: [{ type: Types.ObjectId, ref: 'User', required: true }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
})


const couponModel = model('Coupon', couponSchema)

export default couponModel