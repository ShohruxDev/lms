import express from 'express'
import roleController from '../controllers/roles.js'
const router = express.Router()
router
.get("/roles/all", roleController.getAllRoles)
.post("/roles", roleController.createRole)
.put("/roles/:id", roleController.updateRole)
.delete("/roles/:id", roleController.deleteRole)
export default router  