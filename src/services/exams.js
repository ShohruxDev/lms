import pool from "../config/db.js"
import {extname, join} from "path"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/error.js"
class ExamsService{
    async getAllExams(req,next){
        const {lessonId} = req.params
        const teacherId = req.user.id

        const existLesson = await pool.query(`select c.user_id from lessons l inner join sections s on l.section_id = s.id inner join courses c on s.course_id=c.id where l.id=$1`,[lessonId])
        if (!existLesson.rows.length) {
            return next(new NotFoundError(404,"Lesson not found"))
        }
        let lessonTeacherId = existLesson.rows[0].user_id
        if (req.user.role == "teacher" && teacherId != lessonTeacherId) {
            return next(new ForbiddenError(403,"You cann't get homework of this lesson"))
        }
        const exams = await pool.query(`select * from exams where lesson_id=$1`,[lessonId])
        return {
            status:200,
            data:exams.rows
        }
    }
    async createExam(req, next) {
    const { question, lesson_id, variantA, variantB, variantC, variantD, answer} = req.body

   


    const existLesson = await pool.query(
        `SELECT c.user_id
         FROM lessons l
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE l.id = $1`,
        [lesson_id]
    )

    if (!existLesson.rows.length) {
        return next(new NotFoundError(404, "Lesson not found"))
    }

    const teacherId = existLesson.rows[0].user_id

    if (req.user.role === "teacher" && teacherId != req.user.id) {
        return next(new ForbiddenError(403, "You can't add homework to this lesson"))
    }

    const existsExam = await pool.query(
        "SELECT * FROM exams WHERE question=$1 and lesson_id=$2",
        [question,lesson_id]    
    )

    if (existsExam.rows.length) {
        return next(new ConflictError(409, "Question already exists for this exam"))
    }

    await pool.query(
        `INSERT INTO exams( question, lesson_id, variantA, variantB, variantC, variantD, answer )
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [question, lesson_id, variantA, variantB, variantC, variantD, answer]
    )

  

    return {
        status: 201,
        message: "Exam created!"
    }
}
async updateExam(req, next) {
    const { examId } = req.params

    const {
        question,
        variantA,
        variantB,
        variantC,
        variantD,
        answer
    } = req.body

    const existExam = await pool.query(
        `SELECT e.*, c.user_id
         FROM exams e
         INNER JOIN lessons l ON e.lesson_id = l.id
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE e.id = $1`,
        [examId]
    )

    if (!existExam.rows.length) {
        return next(new NotFoundError(404, "Exam not found"))
    }

    const exam = existExam.rows[0]

    if (req.user.role === "teacher" && exam.user_id != req.user.id) {
        return next(new ForbiddenError(403, "You can't update this exam"))
    }

    if (question) {
        const existsQuestion = await pool.query(
            `SELECT * FROM exams
             WHERE question = $1 AND lesson_id = $2 AND id != $3`,
            [question, exam.lesson_id, examId]
        )

        if (existsQuestion.rows.length) {
            return next(new ConflictError(409, "Question already exists"))
        }
    }

    const fields = []
    const values = []

    const examFields = {
        question,
        variantA,
        variantB,
        variantC,
        variantD,
        answer
    }

    for (const [key, value] of Object.entries(examFields)) {
        if (value !== undefined) {
            values.push(value)
            fields.push(`${key} = $${values.length}`)
        }
    }

    if (!fields.length) {
        return {
            status: 400,
            message: "Please provide data to update"
        }
    }

    values.push(examId)

    await pool.query(
        `UPDATE exams SET ${fields.join(", ")} WHERE id = $${values.length}`,
        values
    )

    return {
        status: 200,
        message: "Exam updated successfully!"
    }
}
async deleteExam(req, next) {
    const { examId } = req.params

    const existExam = await pool.query(
        `SELECT e.*, c.user_id
         FROM exams e
         INNER JOIN lessons l ON e.lesson_id = l.id
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE e.id = $1`,
        [examId]
    )

    if (!existExam.rows.length) {
        return next(new NotFoundError(404, "Exam not found"))
    }

    const exam = existExam.rows[0]

    if (req.user.role === "teacher" && exam.user_id != req.user.id) {
        return next(new ForbiddenError(403, "You can't delete this exam"))
    }

    await pool.query(
        `DELETE FROM exams WHERE id = $1`,
        [examId]
    )

    return {
        status: 200,
        message: "Exam deleted successfully!"
    }
}
}

const examsService = new ExamsService()
export default examsService