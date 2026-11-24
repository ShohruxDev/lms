
import lessonsService from "../services/lessons.js"

class LessonsController {
    async getAllLessons(req,res,next){
        try {
            const resData = await lessonsService.getAllLessons(req,next)

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }  
    
    async createLesson(req, res, next) {
        try {
            const resData = await lessonsService.createLesson(req,next)

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }
    async updateLesson(req, res, next) {
        try {
            const resData = await lessonsService.updateLesson(req, next)
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }

    async deleteLesson(req, res, next) {
        try {
            const resData = await lessonsService.deleteLesson(req, next)
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }
}

const lessonsController = new LessonsController()
export default lessonsController
