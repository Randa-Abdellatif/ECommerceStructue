import { model, Schema, Types } from "mongoose";
const productSchema = new Schema({
    name:{type:String, required:true, unique:true, lowercase: true},
    slug:{type:String, required:true, unique:true, lowercase: true},
    description:{type:String, required:true},
    stock:{type:Number, required:true,default:1},
    price:{type:Number, required:true, default:0},
    discount:{type:Number, default:0},
    paymentPrice:{type:Number, required:true, default:0},
    colors:{type:Array},
    sizes:{type:Array},
    coverImages:{type:Array},
    image:{type:Object, required:true},
    categoryId:{type:Types.ObjectId,ref:"Category", required:true},
    subcategoryId:{type:Types.ObjectId,ref:"SubCategory", required:true},
    brandId:{type:Types.ObjectId,ref:"Brand", required:true},
    avgRate:{type:Number, default:0},
    rateNo:{type:Number, default:0},
    sold:{type:Number, default:0},
    QRCode:{type:String, required: true},
    createdby:{type:Types.ObjectId, ref:"User", required:true},
    wishList:[{type:Types.ObjectId, ref:'User'}]
},{
    timestamps:true
})
const productModel = model('Product', productSchema)
export default productModel