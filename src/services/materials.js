import pool from "../config/db.js"
import {extname, join} from "path"
import { unlink } from "fs/promises"
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/error.js"
class MaterialssService{
    async getAllMaterials(req,next){
        const {lessonId} = req.params
        const teacherId = req.user.id

        const existLesson = await pool.query(`select c.user_id from lessons l inner join sections s on l.section_id = s.id inner join courses c on s.course_id=c.id where l.id=$1`,[lessonId])
        if (!existLesson.rows.length) {
            return next(new NotFoundError(404,"Lesson not found"))
        }
        let lessonTeacherId = existLesson.rows[0].user_id
        if (req.user.role == "teacher" && teacherId != lessonTeacherId) {
            return next(new ForbiddenError(403,"You cann't get materials of this lesson"))
        }
        const materials = await pool.query(`select * from materials where lesson_id=$1`,[lessonId])
        return {
            status:200,
            data:materials.rows
        }
    }
    async createMaterial(req, next) {
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
        return next(new ForbiddenError(403, "You can't add material to this lesson"))
    }

    const existsMaterial = await pool.query(
        "SELECT * FROM materials WHERE lesson_id = $1",
        [lesson_id]
    )

    if (existsMaterial.rows.length) {
        return next(new ConflictError(409, "Material already exists for this lesson"))
    }

    const allowFiletypes = [
        ".pdf", ".doc", ".docx",
        ".ppt", ".pptx",
        ".jpeg", ".jpg", ".png"
    ]

    if (!allowFiletypes.includes(extname(file.name).toLowerCase())) {
        return next(new BadRequestError(400, "Invalid file type"))
    }

    await pool.query(
        `INSERT INTO materials(description, lesson_id, file)
         VALUES($1, $2, $3)`,
        [description, lesson_id, fileName]
    )

    await file.mv(
        join(process.cwd(), "src", "uploads", fileName)
    )

    return {
        status: 201,
        message: "Material created!"
    }
}
async updateMaterial(req, next) {
    const { id } = req.params
    const { description } = req.body
    const file = req.files?.file

    const existMaterial = await pool.query(
        "SELECT * FROM materials WHERE id=$1",
        [id]
    )

    if (!existMaterial.rows.length) {
        return next(new NotFoundError(404, "Material not found"))
    }

    const material = existMaterial.rows[0]

    const existLesson = await pool.query(
        `SELECT c.user_id
         FROM lessons l
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE l.id=$1`,
        [material.lesson_id]
    )

    if (!existLesson.rows.length) {
        return next(new NotFoundError(404, "Lesson not found"))
    }

    const teacherId = existLesson.rows[0].user_id

    if (req.user.role === "teacher" && teacherId != req.user.id) {
        return next(new ForbiddenError(403, "You cannot update this material"))
    }

    const allowFiletypes = [
        ".pdf", ".doc", ".docx",
        ".ppt", ".pptx",
        ".jpeg", ".jpg", ".png"
    ]

    let fileName = material.file

    if (file) {
        const fileExtension = extname(file.name).toLowerCase()

        if (!allowFiletypes.includes(fileExtension)) {
            return next(new BadRequestError(400, "Invalid file type"))
        }

        fileName = Date.now() + fileExtension

        await file.mv(
            join(process.cwd(), "src", "uploads", fileName)
        )
    }

    const updatedMaterial = await pool.query(
        `UPDATE materials
         SET description=$1, file=$2
         WHERE id=$3
         RETURNING *`,
        [
            description ?? material.description,
            fileName,
            id
        ]
    )

    if (file && material.file) {
        try {
            await unlink(
                join(process.cwd(), "src", "uploads", material.file)
            )
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.log(error)
            }
        }
    }

    return {
        status: 200,
        message: "Material updated!",
        data: updatedMaterial.rows[0]
    }
}
async deleteMaterial(req, next) {
    const { id } = req.params

    const existMaterial = await pool.query(
        "SELECT * FROM materials WHERE id=$1",
        [id]
    )

    if (!existMaterial.rows.length) {
        return next(new NotFoundError(404, "Material not found"))
    }

    const material = existMaterial.rows[0]

    const existLesson = await pool.query(
        `SELECT c.user_id
         FROM lessons l
         INNER JOIN sections s ON l.section_id = s.id
         INNER JOIN courses c ON s.course_id = c.id
         WHERE l.id=$1`,
        [material.lesson_id]
    )

    if (!existLesson.rows.length) {
        return next(new NotFoundError(404, "Lesson not found"))
    }

    const teacherId = existLesson.rows[0].user_id

    if (req.user.role === "teacher" && teacherId != req.user.id) {
        return next(new ForbiddenError(403, "You cannot delete this material"))
    }

    await pool.query(
        "DELETE FROM materials WHERE id=$1",
        [id]
    )

    if (material.file) {
        try {
            await unlink(
                join(process.cwd(), "src", "uploads", material.file)
            )
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.log(error)
            }
        }
    }

    return {
        status: 200,
        message: "Material deleted!"
    }
}
}

const materialssService = new MaterialssService()
export default materialssService