
import pool from "../config/db.js"
import {
    ConflictError,
    InternalServerError,
    NotFoundError
} from "../utils/error.js"

class RoleService {
    async getRoles() {
        let roles = await pool.query(`select * from roles`)
        return {
            status: 200,
            data: roles.rows
        }
    }

    async createRole(req, next) {
        try {
            const { name } = req.body

            const existRole = await pool.query(
                `select * from roles where name=$1`,
                [name]
            )

            if (existRole.rows.length) {
                return next(new ConflictError(409, "Role already exist"))
            }

            await pool.query(
                `insert into roles(name) values($1)`,
                [name]
            )

            return {
                status: 201,
                message: 'Role created'
            }

        } catch (error) {
            return next(new InternalServerError(500, error))
        }
    }

async updateRole(req, next) {
    try {
        const { id } = req.params
        const { name } = req.body

        const existRole = await pool.query(
            `select * from roles where id=$1`,
            [id]
        )

        if (!existRole.rows.length) {
            return next(new NotFoundError(404, "Role not found"))
        }

        const duplicateRole = await pool.query(
            `select * from roles where name=$1 and id!=$2`,
            [name, id]
        )

        if (duplicateRole.rows.length) {
            return next(new ConflictError(409, "Role already exist"))
        }

        await pool.query(
            `update roles set name=$1 where id=$2`,
            [name, id]
        )

        return {
            status: 200,
            message: "Role updated"
        }

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}

async deleteRole(req, next) {
    try {
        const { id } = req.params

        const existRole = await pool.query(
            `select * from roles where id=$1`,
            [id]
        )

        if (!existRole.rows.length) {
            return next(new NotFoundError(404, "Role not found"))
        }

        await pool.query(
            `delete from roles where id=$1`,
            [id]
        )

        return {
            status: 200,
            message: "Role deleted"
        }

    } catch (error) {
        return next(new InternalServerError(500, error.message))
    }
}
}

const roleService = new RoleService()
export default roleService
