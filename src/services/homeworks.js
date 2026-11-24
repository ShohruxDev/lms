import pool from "../config/db.js"
import {extname, join} from "path"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/error.js"
import { unlink } from "fs/promises"
class HomeworksService{
    async getAllHomeworks(req,next){
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
        const homeworks = await pool.query(`select * from homeworks where lesson_id=$1`,[lessonId])
        return {
            status:200,
            data:homeworks.rows
        }
    }
    async createHomework(req, next) {
    const { description, lesson_id } = req.body
    const file = req.files?.file

    if (!file) {
        return next(new BadRequestError(400, "File is required"))
    }

    const fileName = Date.now() + extname(file.name)

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

    const existsHomework = await pool.query(
        "SELECT * FROM homeworks WHERE lesson_id = $1",
        [lesson_id]
    )

    if (existsHomework.rows.length) {
        return next(new ConflictError(409, "Homework already exists for this lesson"))
    }

    const allowFiletypes = [
        ".pdf", ".doc", ".docx",
        ".ppt", ".pptx",
        ".jpeg", ".jpg", ".png",".mp4",".mov"
    ]

    if (!allowFiletypes.includes(extname(file.name).toLowerCase())) {
        return next(new BadRequestError(400, "Invalid file type"))
    }

    await pool.query(
        `INSERT INTO homeworks(description, lesson_id, file)
         VALUES($1, $2, $3)`,
        [description, lesson_id, fileName]
    )

    await file.mv(
        join(process.cwd(), "src", "uploads", fileName)
    )

    return {
        status: 201,
        message: "Homework created!"
    }
}
async updateHomework(req, next) {
    const { homeworkId } = req.params
    const { description } = req.body
    const file = req.files?.file

    const existHomework = await pool.query(
        `SELECT h.*, c.user_id
         FROM homeworks h
         INNER JOIN lessons l ON h.lesson_id = l.id
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE h.id = $1`,
        [homeworkId]
    )

    if (!existHomework.rows.length) {
        return next(new NotFoundError(404, "Homework not found"))
    }

    const homework = existHomework.rows[0]

    if (req.user.role === "teacher" && homework.user_id != req.user.id) {
        return next(new ForbiddenError(403, "You can't update this homework"))
    }

    if (description === undefined && !file) {
        return next(new BadRequestError(400, "Please provide data to update"))
    }

    let fileName = homework.file

    if (file) {
        const allowFiletypes = [
            ".pdf", ".doc", ".docx",
            ".ppt", ".pptx",
            ".jpeg", ".jpg", ".png",
            ".mp4", ".mov"
        ]

        if (!allowFiletypes.includes(extname(file.name).toLowerCase())) {
            return next(new BadRequestError(400, "Invalid file type"))
        }

        fileName = Date.now() + extname(file.name)

        await file.mv(
            join(process.cwd(), "src", "uploads", fileName)
        )
    }

    await pool.query(
        `UPDATE homeworks
         SET description = $1, file = $2
         WHERE id = $3`,
        [
            description ?? homework.description,
            fileName,
            homeworkId
        ]
    )

    if (file) {
        try {
            await unlink(
                join(process.cwd(), "src", "uploads", homework.file)
            )
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.log(error)
            }
        }
    }

    return {
        status: 200,
        message: "Homework updated successfully!"
    }
}
async deleteHomework(req, next) {
    const { homeworkId } = req.params

    const existHomework = await pool.query(
        `SELECT h.*, c.user_id
         FROM homeworks h
         INNER JOIN lessons l ON h.lesson_id = l.id
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE h.id = $1`,
        [homeworkId]
    )

    if (!existHomework.rows.length) {
        return next(new NotFoundError(404, "Homework not found"))
    }

    const homework = existHomework.rows[0]

    if (req.user.role === "teacher" && homework.user_id != req.user.id) {
        return next(new ForbiddenError(403, "You can't delete this homework"))
    }

    await pool.query(
        `DELETE FROM homeworks WHERE id = $1`,
        [homeworkId]
    )

    try {
        await unlink(
            join(process.cwd(), "src", "uploads", homework.file)
        )
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.log(error)
        }
    }

    return {
        status: 200,
        message: "Homework deleted successfully!"
    }
}
}

const homeworksService = new HomeworksService()
export default homeworksService