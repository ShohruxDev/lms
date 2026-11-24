import express from 'express'
import sectionController from '../controllers/sections.js'
import {roleGuard} from '../guards/role-guard.js'
import authGuard from '../guards/auth-guard.js'
const router = express.Router()
router
.get("/sections/:courseId",authGuard,roleGuard("admin","teacher","student"),sectionController.getSectionById)

.post("/sections",authGuard,roleGuard("teacher","admin"), sectionController.createSection)

export default router  