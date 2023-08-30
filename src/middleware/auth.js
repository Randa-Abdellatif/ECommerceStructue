import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
// import userModel from "../../DB/model/User.js";

export const roles = {
    admin:'Admin',
    user:'User'
}
Object.freeze(roles)


const auth =(roles = []) =>{
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;
            if (!authorization?.startsWith(process.env.BEARER_KEY)) {
                return res.json({ message: "In-valid bearer key" })
            }
            const token = authorization.split(process.env.BEARER_KEY)[1]
            if (!token) {
                return res.json({ message: "In-valid token" })
            }
            const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
            if (!decoded?.id) {
                return res.json({ message: "In-valid token payload" })
            }
            const authUser = await userModel.findById(decoded.id).select('-password')
            if (!authUser) {
                return res.json({ message: "Not register account" })
            }
            if(!roles.includes(authUser.role)){
                return res.status(StatusCodes.UNAUTHORIZED).json({message:"you are not authorized to access this end point"});
            }
            req.user = authUser;
            return next()
        } catch (error) {
            return res.json({ message: "Catch error" , err:error?.message })
        }
    }
}


export default auth