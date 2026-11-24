
import materialssService from "../services/materials.js"

class MaterialsController {
    async getAllMaterial(req, res, next) {
        try {
            const resData = await materialssService.getAllMaterials(req, next)

            if (!resData) return

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }

    async createMaterial(req, res, next) {
        try {
            const resData = await materialssService.createMaterial(req, next)

            if (!resData) return

            return res.status(resData.status).json(resData)

        } catch (error) {
            next(error)
        }
    }
    async updateMaterial(req, res, next) {
        try {
            const resData = await materialssService.updateMaterial(req, next)
            if (!resData) return
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }

    async deleteMaterial(req, res, next) {
        try {
            const resData = await materialssService.deleteMaterial(req, next)
            if (!resData) return
            return res.status(resData.status).json(resData)
        } catch (error) {
            next(error)
        }
    }
}

const materialsController = new MaterialsController()

export default materialsController
