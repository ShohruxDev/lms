
import express from 'express'
import materialsController from '../controllers/materials.js'
import authGuard from '../guards/auth-guard.js'
import { roleGuard } from '../guards/role-guard.js'

const router = express.Router()

router
    .get(
        "/materials/:lessonId",
        authGuard,
        materialsController.getAllMaterial
    )
    .post(
        "/materials",
        authGuard,
        roleGuard("admin", "teacher"),
        materialsController.createMaterial
    )
    .put(
        "/materials/:id",
        authGuard,
        roleGuard("admin", "teacher"),
        materialsController.updateMaterial
    )
    .delete(
        "/materials/:id",
        authGuard,
        roleGuard("admin", "teacher"),
        materialsController.deleteMaterial
    )

export default router
