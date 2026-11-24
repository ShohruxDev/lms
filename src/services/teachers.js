import pool from "../config/db.js"
import {
    BadRequestError,
    NotFoundError
} from "../utils/error.js"
class TeacherService{
    async getallTeacher(next){
        let role = await pool.query(`select * from roles where name='teacher'`)
        let role_id = role.rows[0].id
        console.log(role.rows);
   let teachers = await pool.query(`select * from users where role_id=${role_id}`)
   return {
    status:200,
    data:teachers.rows
   }
    }
    async updateTeacher(req, next) {
        const { id } = req.params
        const { fullname, phone, password } = req.body
    
        const existTeacher = await pool.query(
            `SELECT u.*
             FROM users u
             INNER JOIN roles r ON u.role_id = r.id
             WHERE u.id=$1 AND r.name='teacher'`,
            [id]
        )
    
        if (!existTeacher.rows.length) {
            return next(new NotFoundError(404, "Teacher not found"))
        }
    
        if (!fullname && !phone && !password) {
            return next(new BadRequestError(400, "At least one field is required"))
        }
    
        let updatedTeacher = await pool.query(
            `UPDATE users
             SET fullname = COALESCE($1, fullname),
                 phone = COALESCE($2, phone)
             WHERE id=$3
             RETURNING id, fullname, phone, role_id, status`,
            [
                fullname || null,
                phone || null,
                id
            ]
        )
    
        if (password) {
            const argon2 = await import("argon2")
            const hashedPassword = await argon2.default.hash(password)
    
            updatedTeacher = await pool.query(
                `UPDATE users
                 SET password=$1
                 WHERE id=$2
                 RETURNING id, fullname, phone, role_id, status`,
                [hashedPassword, id]
            )
        }
    
        return {
            status: 200,
            message: "Teacher updated!",
            data: updatedTeacher.rows[0]
        }
    }
    async deleteTeacher(req, next) {
        const { id } = req.params
    
        const existTeacher = await pool.query(
            `SELECT u.*
             FROM users u
             INNER JOIN roles r ON u.role_id = r.id
             WHERE u.id=$1 AND r.name='teacher'`,
            [id]
        )
    
        if (!existTeacher.rows.length) {
            return next(new NotFoundError(404, "Teacher not found"))
        }
    
        await pool.query(
            "DELETE FROM users WHERE id=$1",
            [id]
        )
    
        return {
            status: 200,
            message: "Teacher deleted!"
        }
    }
    
}

const teacherService = new TeacherService()
export default teacherService
