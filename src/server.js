import { configDotenv } from 'dotenv'
import express from 'express'
configDotenv()
const app = express()
app.use(express.json())

app.listen(process.env.PORT, () => {
    console.log('Server is running...');
})