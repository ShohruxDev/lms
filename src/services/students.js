
import pool from "../config/db.js"
import { ForbiddenError, NotFoundError } from "../utils/error.js"

class StudentService {
    async getMyCourses(req) {
        const studentId = req.user.id

        let courses = await pool.query(
            `SELECT c.id, c.name, c.banner, u.photo, u.fullname
             FROM payments p
             JOIN courses c ON p.course_id = c.id join users u on c.user_id = u.id
             WHERE p.student_id = $1`,
            [studentId]
        )

        return {
            status: 200,
            data: courses.rows.map(course => ({
                id: course.id,
                course_name: course.name,
                banner: course.banner,
                teacher: {
                    fullname: course.fullname,
                    photo: course.photo
                }
            }))
        }
      
    }

    async buyCourses(req,next){
        const studentId = req.user.id
        const {courseId} = req.params
        let existCourse = await pool.query(`select * from courses where id=$1`,[courseId])
        if (!existCourse.rows.length) {
            return next(new NotFoundError(404,'Course not found with this id'))
        }
        if (!existCourse.rows.length.aprove) {
            return next(new ForbiddenError(403,'You can not buy this course'))
        }
        await pool.query(`insert into payments(student_id, course_id) values($1,$2)`,[studentId,courseId])
        return {
            status:201,
            message:'Student buy courses'
        }
    }
}

const studentService = new StudentService()
export default studentService
