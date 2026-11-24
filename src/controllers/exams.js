
import examsService from "../services/exams.js"

class ExamsController {
    async getAllExams(req, res, next) {
        try {
            const resData = await examsService.getAllExams(req, next)

            if (!resData) return

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }

    async createExam(req, res, next) {
        try {
            const resData = await examsService.createExam(req, next)

            if (!resData) return

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }
    async updateExam(req, res, next) {
        try {
            const resData = await examsService.updateExam(req, next)
    
            if (!resData) return
    
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }
    
    async deleteExam(req, res, next) {
        try {
            const resData = await examsService.deleteExam(req, next)
    
            if (!resData) return
    
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }
}

const examsController = new ExamsController()

export default examsController
