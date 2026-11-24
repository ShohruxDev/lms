import coursesServices from "../services/courses.js";

class CoursesController{
    async getCourses(req,res,next){
        let resData = await coursesServices.getCourses()
        if (resData) {
            return res.status(resData.status).json(resData)
        } 
    }
    async getMyCourses(req,res,next){
        let resData = await coursesServices.getMyCourses(req,next)
        if (resData) {
            return res.status(resData.status).json(resData)
        } 
    }
    async gettAllCourses(req,res,next){
        let resData = await coursesServices.gettAllCourses()
        if (resData) {
            return res.status(resData.status).json(resData)
        } 
    }
    async createCourse(req,res,next){
        let resData = await coursesServices.createCourse(req,next)
        if (resData) {
            return res.status(resData.status).json(resData)
        }
    }
    async approveCourse(req,res,next){
        let resData = await coursesServices.approveCourse(req,next)
        if (resData) {
            return res.status(resData.status).json(resData)
        } 
    }
    async courseUpdated(req,res,next){
        let resData = await coursesServices.courseUpdated(req,next)
        if (resData) {
            return res.status(resData.status).json(resData)
        } 
    }
    async deleteCourse(req, res, next) {
        let resData = await coursesServices.deleteCourse(req, next)
    
        if (resData) {
            return res.status(resData.status).json(resData)
        }
    }
}

const coursesController = new CoursesController()
export default coursesController