
import homeworksService from "../services/homeworks.js"

class HomeworksController {
    async getAllHomeworks(req, res, next) {
        try {
            const resData = await homeworksService.getAllHomeworks(req, next)

            if (!resData) return

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }

    async createHomework(req, res, next) {
        try {
            const resData = await homeworksService.createHomework(req, next)

            if (!resData) return

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }
    async updateHomework(req, res, next) {
        try {
            const resData = await homeworksService.updateHomework(req, next)
    
            if (!resData) return
    
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }
    
    async deleteHomework(req, res, next) {
        try {
            const resData = await homeworksService.deleteHomework(req, next)
    
            if (!resData) return
    
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }
}

const homeworksController = new HomeworksController()

export default homeworksController
