import  Jwt  from "jsonwebtoken";
import { BadRequestError, InternalServerError, UnauthorizedError } from "../utils/error.js";
export default(req,res,next) => {
    try {
        const {token} = req.headers
        if (!token) {
           return next(new UnauthorizedError(401,"Unauthorized user")) 
        }
        const user = Jwt.verify(token, process.env.JWT_SECRET)
        req.user = user
       return next()
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return next(new BadRequestError(400,"Invalid token"))
        }
        if (error.name === "TokenExpiredError") {
            return next(new BadRequestError(400,error.message))
        }
        next(new InternalServerError(500,error))
    }
}