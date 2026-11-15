import sectinService from "../services/sections.js"

class SectionController{
    async getSectionById(req,res,next){
        const resData = await sectinService.getSectionById(req,next)
        if (resData) {
            return res.status(resData.status).json(resData)
        }
    }
async createSection(req,res,next){
    const resData = await sectinService.createSection(req,next)
    if (resData) {
        return res.status(resData.status).json(resData)
    }
}
}

const sectionController = new SectionController()
export default sectionController