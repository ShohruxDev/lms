import pool from "../config/db.js"
import { ForbiddenError, NotFoundError } from "../utils/error.js"

class SectinService{
    async getSectionById(req,next){
            const {courseId} = req.params
            const userId = req.user.id
            const existCourse = await pool.query("select * from courses where id=$1",[courseId])
            if (!existCourse.rows.length) {
                next(new NotFoundError(404,"Course not found"))
            }
            if (req.user.role == "teacher" &&   userId != existCourse.rows[0].user_id) {
                return next(new ForbiddenError(403,"You cann't section to this course"))
             }
             if (req.user.role == "student") {
                const payments = await pool.query(`select * from payments where student_id=$1 and course_id=$2`,[userId,courseId])
                if (!payments.rows.length) {
                    return next(new ForbiddenError(403,'You can not see this course'))
                }
             }
            const sections = await pool.query("select * from sections where course_id=$1",[courseId])
            return {
                status:200,
                data:sections.rows
            }
        }
    async createSection(req,next){
    const {name, course_id} = req.body
    const teacherId = req.user.id
    const existCourse = await pool.query("select * from courses where id=$1",[course_id])
    if (!existCourse.rows.length) {
       return next(new NotFoundError(404,"Course not found"))
    }
    if (teacherId != existCourse.rows[0].user_id) {
        return next(new ForbiddenError(403,"You cann't section to this course"))
     }
    const existSection = await pool.query("select * from sections where name=$1 and course_id=$2",[name,course_id])
    if (existSection.rows.length) {
        next(new NotFoundError(409,"Section already exist"))
    }
    await pool.query("insert into sections(name, course_id) values($1,$2)",[name,course_id])
    return {
        status:201,
        message:'Create section'
    }
    }
}

const sectinService = new SectinService()
export default sectinService