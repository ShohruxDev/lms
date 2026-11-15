import express from 'express'
// import middleware from '../middleware/validations.js'
import categoryController from '../controllers/categories.js'
import userController from '../controllers/users.js'
import {roleGuard} from '../guards/role-guard.js'
import authGuard from '../guards/auth-guard.js'
const router = express.Router()
router
.get("/categories/all",authGuard,roleGuard("admin") ,categoryController.getAllCategories)
// .post("/admins",middleware.createUsers, userController.createAdmin)
.post("/categories", authGuard, roleGuard("admin"),categoryController.createCategory)
// .post("/teachers", userController.createTeacher)
// .delete("/users/:userId",userController.deleteUser)
export default router  