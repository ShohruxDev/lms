import authService from "../services/auth.js"

class AuthController {
    async login(req, res, next) {
        try {
            const resData = await authService.login(req, res, next)

            if (resData) {
                return res.status(resData.status).json(resData)
            }
        } catch (error) {
            return next(error)
        }
    }
}

const authController = new AuthController()

export default {
    authController
}