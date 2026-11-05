import express from 'express'
import middleware from '../middleware/validations.js'
import userController from '../controllers/users.js'
const router = express.Router()
router
.get("/admins", userController.getAdmins)
.post("/users",middleware.createUsers, userController.createUser)
export default router   