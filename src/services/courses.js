import pool from "../config/db.js"
import {extname, join} from 'path'
import { NotFoundError } from "../utils/error.js"
class CoursesServices{
    async getMyCourses(req,next){
        const teacherId = req.user.id
        const courses = await pool.query(`select * from courses where user_id=${teacherId}`)
        return {
            status:200,
            data:courses.rows
        }  
    }
    async getCourses(){
        const courses = await pool.query(`select * from courses where approve=true`)

        return {
            status:200,
            data:courses.rows
        }  
    }
    async gettAllCourses(){
        const courses = await pool.query(`select * from courses`)

        return {
            status:200,
            data:courses.rows
        }
    }
    async createCourse(req,next){
    const {name, description, level, price, category_id} = req.body
    const {banner, intro_video} = req.files
    const teacherId = req.user.id
    const existCategory = await pool.query("select * from categories where id=$1",[category_id])
    if (!existCategory.rows.length) {
        return next(new NotFoundError(404,"Category not found with this id"))
    }
    const fileName_banner = Date.now() + extname(banner.name)
    const fileName_intro_video = Date.now() + extname(intro_video.name)
    await pool.query(`insert into courses(banner,intro_video,name,description, level, price, category_id,user_id) values($1,$2,$3,$4,$5,$6,$7,$8)`,[fileName_banner,fileName_intro_video,name,description,level,price,category_id,teacherId])
    banner.mv(join(process.cwd(),"src","uploads",fileName_banner), err => {
        if (err) {
           console.log(err); 
        }
    })
    intro_video.mv(join(process.cwd(),"src","uploads",fileName_intro_video), err => {
        if (err) {
           console.log(err); 
        }
    })
    return {
        status:201,
        message:"Corse added!"
    }
    
}
async approveCourse(req,next){
    const {courseId} = req.params
    const existCourse = await pool.query(`select * from courses where id=$1`,[courseId])
    if (!existCourse.rows.length) {
        next(new NotFoundError(404,"Course not found"))
    }
    await pool.query(`update courses set approve=${existCourse.rows[0].approve ? false : true} where id=$1`,[courseId])
     return {
        status:200,
        message:'Course approved!'
     }
}
async courseUpdated(req, next) {
    const { courseId } = req.params

    const existCourse = await pool.query(
        `select * from courses where id=$1`,
        [courseId]
    )

    if (!existCourse.rows.length) {
        return next(new NotFoundError(404, "Course not found"))
    }

    const { name, description, level, price, category_id } = req.body

    const files = req.files || {}

    const fields = []
    const values = []

    const allowedFields = {
        name,
        description,
        level,
        price,
        category_id
    }

    if (category_id !== undefined) {
        const existCategory = await pool.query(
            `select * from categories where id=$1`,
            [category_id]
        )

        if (!existCategory.rows.length) {
            return next(new NotFoundError(404, "Category not found"))
        }
    }

    for (const [key, value] of Object.entries(allowedFields)) {
        if (value !== undefined) {
            values.push(value)
            fields.push(`${key}=$${values.length}`)
        }
    }

    if (files.banner) {
        const bannerName = Date.now() + extname(files.banner.name)

        await files.banner.mv(
            join(process.cwd(), "src", "uploads", bannerName)
        )

        values.push(bannerName)
        fields.push(`banner=$${values.length}`)
    }

    if (files.intro_video) {
        const videoName = Date.now() + extname(files.intro_video.name)

        await files.intro_video.mv(
            join(process.cwd(), "src", "uploads", videoName)
        )

        values.push(videoName)
        fields.push(`intro_video=$${values.length}`)
    }

    if (!fields.length) {
        return {
            status: 400,
            message: "Update uchun ma'lumot yuboring"
        }
    }

    values.push(courseId)

    await pool.query(
        `UPDATE courses SET ${fields.join(", ")} WHERE id=$${values.length}`,
        values
    )

    return {
        status: 200,
        message: "Course updated successfully!"
    }
}
async deleteCourse(req, next) {
    const { courseId } = req.params

    const existCourse = await pool.query(
        `SELECT * FROM courses WHERE id=$1`,
        [courseId]
    )

    if (!existCourse.rows.length) {
        return next(new NotFoundError(404, "Course not found"))
    }

    await pool.query(
        `DELETE FROM courses WHERE id=$1`,
        [courseId]
    )

    return {
        status: 200,
        message: "Course deleted successfully!"
    }
}
}

const coursesServices = new CoursesServices()
export default coursesServices