import pool from "../config/db.js"
import userServices from "../services/users.js"
import { InternalServerError, NotFoundError } from "../utils/error.js"
class UserController{
    async getAdmins(req, res, next){
        let resData = await userServices.getAdmins(next)
        if (resData) {
            return res.status(resData.status).json(resData)   
        }
    }
   
    async createAdmin(req, res){
        let resData = await userServices.createAdmin(req)
        return res.status(resData.status).json(resData)
    }
    async createTeacher(req,res,next){
        let resData = await userServices.createTeacher(req,next)
        if (resData) {
            return res.status(resData.status).json(resData)   
        } 
    }
   async deleteUser(req,res,next){
    let resData = await userServices.deleteUser(req,next)
    if (resData) {
        return res.status(resData.status).json(resData)   
    }
   }
}

const userController = new UserController()
export default userController
