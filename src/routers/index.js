import express from 'express'
import roleRouter from './roles.js'
import userRouter from './users.js'
import authRouter from './auth.js'
import teacherRouter from './teachers.js' 
import categoryRouter from './categories.js'  
import courseRouter from './courses.js'  
import sectionRouter from './sections.js'  
import lessonRouter from './lessons.js'
import materialsRouter from './materials.js'
import homeworksRouter from './homeworks.js'
import examsRouter from './exams.js'
import studentRouter from './students.js'

const appRouter = express.Router()
appRouter.use("/api/v1", roleRouter)
appRouter.use("/api/v1", userRouter)
appRouter.use("/api/v1", authRouter)
appRouter.use("/api/v1", teacherRouter) 
appRouter.use("/api/v1", categoryRouter) 
appRouter.use("/api/v1", courseRouter) 
appRouter.use("/api/v1", sectionRouter) 
appRouter.use("/api/v1", lessonRouter)
appRouter.use("/api/v1", materialsRouter)
appRouter.use("/api/v1", homeworksRouter)
appRouter.use("/api/v1", examsRouter) 
appRouter.use("/api/v1", studentRouter) 




export default appRouter