import pool from "../config/db.js"
import { ConflictError } from "../utils/error.js"

class CategoriesService{
    async getAllCategories(){
        const categories = await pool.query("select * from categories where status='active'")
        return {
            status:200,
            data:categories.rows
        }
    }
    async createCategory(req,next){
     const {name} = req.body
     const existCategory = await pool.query(`select * from categories where name=$1`,[name])

     if (existCategory.rows.length) {
        return next(new ConflictError(409,'Category name already exist'))
     }
     await pool.query(`insert into categories(name) values($1)`,[name])
     return {
        status:201,
        message:"Category added!"
     }
    }
    async updateCategory(req, next) {
        const { categoryId } = req.params
        const { name } = req.body

        const existCategory = await pool.query(
            `select * from categories where id=$1`,
            [categoryId]
        )

        if (!existCategory.rows.length) {
            return next(new ConflictError(404, "Category not found"))
        }

        const existName = await pool.query(
            `select * from categories where name=$1 and id!=$2`,
            [name, categoryId]
        )

        if (existName.rows.length) {
            return next(new ConflictError(409, "Category name already exist"))
        }

        await pool.query(
            `update categories set name=$1 where id=$2`,
            [name, categoryId]
        )

        return {
            status: 200,
            message: "Category updated!"
        }
    }

    async deleteCategory(req, next) {
        const { categoryId } = req.params

        const existCategory = await pool.query(
            `select * from categories where id=$1`,
            [categoryId]
        )

        if (!existCategory.rows.length) {
            return next(new ConflictError(404, "Category not found"))
        }

        await pool.query(
            `delete from categories where id=$1`,
            [categoryId]
        )

        return {
            status: 200,
            message: "Category deleted!"
        }
    }
}

const categoriesService = new CategoriesService()
export default categoriesService