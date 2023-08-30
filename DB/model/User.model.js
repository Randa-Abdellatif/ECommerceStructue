import { Schema, Types, model } from "mongoose";


const userSchema = new Schema({

    name: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char']

    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },

    // active: {
    //     type: Boolean,
    //     default: false,
    // },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    image: {type: Object},
    DOB: Date,
    code:{
        type: String,
        min: [6, 'length must be 2'],
        max: [6, 'length must be 2']
    },
    favorites:[
        {
            type: Types.ObjectId,
            ref:'Product'
        }
    ]
}, {
    timestamps: true
})


const userModel = model('User', userSchema)
export default userModel