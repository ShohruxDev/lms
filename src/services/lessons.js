import pool from "../config/db.js"
import {extname, join} from "path"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/error.js"
class LessonsService{
    async getAllLessons(req,next){
        const {sectionId} = req.params
        const teacherId = req.user.id

        const existSection = await pool.query(`select c.user_id from sections s inner join courses c on s.course_id = c.id where s.id=$1`,[sectionId])
        if (!existSection.rows.length) {
            return next(new NotFoundError(404,"Section not found"))
        }
        let sectionTeacherId = existSection.rows[0].user_id
        if (req.user.role == "teacher" && teacherId != sectionTeacherId) {
            return next(new ForbiddenError(403,"You cann't get lessons of this section"))
        }
        const lessons = await pool.query(`select * from lessons where section_id=$1`,[sectionId])
        return {
            status:200,
            data:lessons.rows
        }
    }
    async createLesson(req,next){
        const {name,descripton,section_id} = req.body
        const {file} = req.files 
        const fileName = Date.now() + extname(file.name)
        const existSection = await pool.query("select c.user_id from sections s inner join courses c on s.course_id = c.id where s.id=$1",[section_id])
        if (!existSection.rows.length) {
            next(new NotFoundError(404,"Section not found"))
        }
        let teacherId = existSection.rows[0].user_id
        if (req.user.role == "teacher" && teacherId != req.user.id) {
            return next(new ForbiddenError(403,"You cann't add lesson to this course"))
        }
        const existLesson = await pool.query("select * from lessons where name=$1 and section_id=$2",[name,section_id])
        if (existLesson.rows.length) {
            return next(new ConflictError(409,"Lesson name already ecist whith this section"))
        }
        const allowFiletypes = [".mp4",".mov",".avi",".wmv",".flv",".mkv"]
        if (!allowFiletypes.includes(extname(file.name))) {
            return next(new BadRequestError(400,"Invalid file type"))
        }

        await pool.query(
            "INSERT INTO lessons(name, description, section_id, file) VALUES($1, $2, $3, $4)",
            [name, descripton, section_id, fileName]
        )
        file.mv(join(process.cwd(),"src","uploads","fileName"), (err) => {
            if (err) {
                console.log(err);
            }
        })
        
        return {
            status:201,
            message:"Lesson created!"
        }
    }
    async updateLesson(req, next) {
        const { id } = req.params
        const { name, description } = req.body
    
        const existLesson = await pool.query(
            "SELECT * FROM lessons WHERE id=$1",
            [id]
        )
    
        if (!existLesson.rows.length) {
            return next(new NotFoundError(404, "Lesson not found"))
        }
    
        const lesson = existLesson.rows[0]
    
        const existSection = await pool.query(
            `SELECT c.user_id
             FROM sections s
             INNER JOIN courses c ON s.course_id = c.id
             WHERE s.id=$1`,
            [lesson.section_id]
        )
    
        if (!existSection.rows.length) {
            return next(new NotFoundError(404, "Section not found"))
        }
    
        const teacherId = existSection.rows[0].user_id
    
        if (req.user.role === "teacher" && teacherId != req.user.id) {
            return next(new ForbiddenError(403, "You cannot update this lesson"))
        }
    
        const updatedLesson = await pool.query(
            `UPDATE lessons
             SET name=$1, description=$2
             WHERE id=$3
             RETURNING *`,
            [
                name ?? lesson.name,
                description ?? lesson.description,
                id
            ]
        )
    
        return {
            status: 200,
            message: "Lesson updated!",
            data: updatedLesson.rows[0]
        }
    }
    async deleteLesson(req, next) {
        const { id } = req.params
    
        const existLesson = await pool.query(
            "SELECT * FROM lessons WHERE id=$1",
            [id]
        )
    
        if (!existLesson.rows.length) {
            return next(new NotFoundError(404, "Lesson not found"))
        }
    
        const lesson = existLesson.rows[0]
    
        const existSection = await pool.query(
            `SELECT c.user_id
             FROM sections s
             INNER JOIN courses c ON s.course_id = c.id
             WHERE s.id=$1`,
            [lesson.section_id]
        )
    
        if (!existSection.rows.length) {
            return next(new NotFoundError(404, "Section not found"))
        }
    
        const teacherId = existSection.rows[0].user_id
    
        if (req.user.role === "teacher" && teacherId != req.user.id) {
            return next(new ForbiddenError(403, "You cannot delete this lesson"))
        }
    
        await pool.query(
            "DELETE FROM lessons WHERE id=$1",
            [id]
        )
    
        return {
            status: 200,
            message: "Lesson deleted!"
        }
    }
}

const lessonsService = new LessonsService()
export default lessonsService