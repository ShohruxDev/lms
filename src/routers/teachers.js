import express from 'express'
// import middleware from '../middleware/validations.js'
import teacherController from '../controllers/teachers.js'
import userController from '../controllers/users.js'
import {roleGuard} from '../guards/role-guard.js'
import authGuard from '../guards/auth-guard.js'
const router = express.Router()
router
.get("/teachers/all",authGuard,roleGuard("admin") ,teacherController.getAllteachers)
// .post("/admins",middleware.createUsers, userController.createAdmin)
// .post("/admins", authGuard, roleGuard("admin"),middleware.createUsers,userController.createAdmin)
.post("/teachers", userController.createTeacher)
// .delete("/users/:userId",userController.deleteUser)
export default router  