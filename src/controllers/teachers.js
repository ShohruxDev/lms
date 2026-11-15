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
}

const teacherController = new TeacherController()
export default teacherController