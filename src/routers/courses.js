import express from 'express'
import middleware from '../middleware/validations.js'
import coursesController from '../controllers/courses.js'
import userController from '../controllers/users.js'
import {roleGuard} from '../guards/role-guard.js'
import authGuard from '../guards/auth-guard.js'
const router = express.Router()
router
.get("/courses",coursesController.getCourses)
.get("/courses/my",authGuard,roleGuard("teacher","student"),coursesController.getMyCourses)

.get("/courses/all",authGuard,roleGuard("admin") ,coursesController.gettAllCourses)

// .post("/admins",middleware.createUsers, userController.createAdmin)
// .post("/admins", authGuard, roleGuard("admin"),middleware.createUsers,userController.createAdmin)
.post("/courses",authGuard,roleGuard("teacher"),middleware.createCourse, coursesController.createCourse)
.put("/courses/approve/:courseId",authGuard,roleGuard("admin"), coursesController.approveCourse)
.put("/courses/:coursesId",authGuard,roleGuard("admin"),coursesController.courseUpdated)
// .delete("/users/:userId",userController.deleteUser)
// .put(
//     "/courses/:courseId",
//     authGuard,
//     roleGuard("admin"),
//     coursesController.courseUpdated
// )
.delete(
    "/courses/:courseId",
    authGuard,
    roleGuard("admin"),
    coursesController.deleteCourse
)
export default router   