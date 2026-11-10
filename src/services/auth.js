import pool from "../config/db.js"
import { NotFoundError } from "../utils/error.js"
import argon from "argon2"
import JWT from 'jsonwebtoken'
class AuthService {
    async login(req, res, next) {
        const { phone, password } = req.body

        let existUser = await pool.query(
            `SELECT * FROM users WHERE phone = $1`,
            [phone]
        )
         existUser = existUser.rows[0]
        if (!existUser) {
            return next(new NotFoundError(
                404,
                "User not found with this phone or password wrong"
            ))
        }

        const isPasswordValid = await argon.verify(
            existUser.password,
            password
        )

        if (!isPasswordValid) {
            return next(new NotFoundError(
                404,
                "User not found with this phone or password wrong"
            ))
        }

        const role = await pool.query(`select r.name from users u inner join roles r on u.role_id=r.id where u.role_id=${existUser.role_id}`)
        return {
            status: 200,
            message: "User login",
            role:role.rows[0].name,
            accessToken: JWT.sign({id:existUser.id,phone:existUser.phone,role:role.rows[0].name},"Shaptoli",{expiresIn:"30m"}),
            refreshToken: JWT.sign({id:existUser.id,phone:existUser.phone,role:role.rows[0].name},"Shaptoli",{expiresIn:"24h"})
        }
    }
}

const authService = new AuthService()
export default authService