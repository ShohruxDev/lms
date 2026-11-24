import pool from "../config/db.js"
import argon from 'argon2'
import { InternalServerError, NotFoundError } from "../utils/error.js"
class UserServices{
    async getAdmins(next){
   try {
    const role = await pool.query(`select users.id, fullname, phone, photo, users.created_at, users.status, roles.name as role from users inner join roles on roles.id =  users.role_id where roles.name='admin'`)
    return {
        status:200,
        data:role.rows
    }
   } catch (error) {
   return next(new InternalServerError(500,error))
   }
}
 async createAdmin(req, res, next){
   try {
    const {fullname, phone, password, role_id} = req.body
    const existUser = await pool.query(`select * from users where phone=$1`,[phone])
    if ( existUser.rows.length) {
        return {
            status:409,
            message:"User already exist"
        }
    }
    const existRole = await pool.query(`select * from roles where id=$1`,[role_id])
    if (!existRole.rows.length) {
        return {
            status:404,
            message:"Role not found with this id"
        }
    }
    const hashPassword = await argon.hash(password)
    await pool.query(
        `INSERT INTO users(fullname, phone, password, role_id)
         VALUES($1, $2, $3, $4)`,
        [fullname, phone, hashPassword, role_id]
    )
    return {
        status:201,
        message:"User created!"
    }
   } catch (error) {
    return next(new InternalServerError(500, error.message))
   }
}
async createTeacher(req, next) {
    try {
        const {
            fullname,
            phone,
            password,
            role_id,
            experience,
            job,
            portfolio,
            description,
            github,
            instagram,
            facebook,
            telegram,
            linkedin
        } = req.body

        // Telefon raqami mavjudligini tekshirish
        const existUser = await pool.query(
            `SELECT id FROM users WHERE phone = $1`,
            [phone]
        )

        if (existUser.rows.length) {
            return {
                status: 409,
                message: "User already exists"
            }
        }

        // Berilgan role_id teacher ekanini tekshirish
        const existRole = await pool.query(
            `SELECT id FROM roles WHERE id = $1 AND name = $2`,
            [role_id, "teacher"]
        )

        if (!existRole.rows.length) {
            return {
                status: 404,
                message: "Teacher role not found"
            }
        }

        // Parolni hash qilish
        const hashPassword = await argon.hash(password)

        // User yaratish
        const teacher = await pool.query(
            `INSERT INTO users(fullname, phone, password, role_id)
             VALUES($1, $2, $3, $4) RETURNING id`,
            [fullname, phone, hashPassword, role_id]
        )

        const teacher_id = teacher.rows[0].id

        // Mentor profilini yaratish
        await pool.query(
            `INSERT INTO mentor_profile(
                user_id, experience, job, portfolio,
                description, github, instagram,
                facebook, telegram, linkedin
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                teacher_id,
                experience ?? null,
                job ?? null,
                portfolio ?? null,
                description ?? null,
                github ?? null,
                instagram ?? null,
                facebook ?? null,
                telegram ?? null,
                linkedin ?? null
            ]
        )

        return {
            status: 201,
            message: "Teacher created!"
        }

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}
async deleteUser(req,res,next){
    try {
     const {userId} = req.params
     const existUser = await pool.query("select * from users where id=$1",[userId])
     if (!existUser.rows.length) {
       return  next(new NotFoundError(404,"User not found with this id"))
     }
     await pool.query("delete from users where id=$1",[userId])
     return{
         status:200,
         message:"User deleted"
     }
    } catch (error) {
     next(new InternalServerError(500,error))
    }
 }

async updateUser(req, next) {
    try {
        const { userId } = req.params
        const { fullname, phone, password, role_id } = req.body

        // User mavjudligini tekshirish
        const existUser = await pool.query(
            `SELECT * FROM users WHERE id=$1`,
            [userId]
        )

        if (!existUser.rows.length) {
            return next(new NotFoundError(404, "User not found"))
        }

        // Telefon raqami boshqa userda borligini tekshirish
        const existPhone = await pool.query(
            `SELECT * FROM users WHERE phone=$1 AND id!=$2`,
            [phone, userId]
        )

        if (existPhone.rows.length) {
            return {
                status: 409,
                message: "Phone number already exists"
            }
        }

        // Role mavjudligini tekshirish
        const existRole = await pool.query(
            `SELECT * FROM roles WHERE id=$1`,
            [role_id]
        )

        if (!existRole.rows.length) {
            return {
                status: 404,
                message: "Role not found"
            }
        }

        // Parolni hash qilish
        const hashPassword = await argon.hash(password)

        // User ma'lumotlarini yangilash
        await pool.query(
            `UPDATE users
             SET fullname=$1, phone=$2, password=$3, role_id=$4
             WHERE id=$5`,
            [fullname, phone, hashPassword, role_id, userId]
        )

        return {
            status: 200,
            message: "User updated successfully"
        }

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

} 

const userServices = new UserServices()
export default userServices