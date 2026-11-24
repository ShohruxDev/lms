import teacherService from "../services/teachers.js"

class TeacherController{
    async getAllteachers(req,res,next){
   try {
    let resData =  await teacherService.getallTeacher()
    if (resData) {
        return res.status(resData.status).json(resData)
    }
   } catch (error) {
    return next(error)
   }
    }
    async updateTeacher(req, res, next) {
        try {
            const resData = await teacherService.updateTeacher(req, next)
    
            if (resData) {
                return res.status(resData.status).json(resData)
            }
        } catch (error) {
            next(error)
        }
    }
    
    async deleteTeacher(req, res, next) {
        try {
            const resData = await teacherService.deleteTeacher(req, next)
    
            if (resData) {
                return res.status(resData.status).json(resData)
            }
        } catch (error) {
            next(error)
        }
    }
}

const teacherController = new TeacherController()
export default teacherController