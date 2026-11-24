
import studentService from "../services/students.js"

class StudentsController {
    async getMyCourses(req, res, next) {
        try {
            const resData = await studentService.getMyCourses(req)

            if (resData) {
                return res.status(resData.status).json(resData)
            }
        } catch (error) {
            return next(error)
        }
    }

    async buyCourses(req,res,next){
        try {
            const resData = await studentService.buyCourses(req,next)

            if (resData) {
                return res.status(resData.status).json(resData)
            }
        } catch (error) {
            return next(error)
        }
    }
}

const studentsController = new StudentsController()
export default studentsController
