import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
const app = express()

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))


// Router
import authRouter from "./routes/auth.routes.js"
import problemRouter from "./routes/problem.routes.js"
import codeExecutionRouter from "./routes/executeCode.routes.js"
import submissionRouter from "./routes/submission.routes.js"
import listRouter from "./routes/customlist.routes.js"

// Routes
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/problems",problemRouter)
app.use("/api/v1/",codeExecutionRouter)
app.use("/api/v1/submission",submissionRouter)
app.use("/api/v1/list", listRouter)

// basic default route
app.get("/", (req,res) =>{
    res.send("Hello welcome, server is working fine!!!!!!")
})


const port = process.env.PORT || 8080

app.listen(port,(req,res) => {
    console.log(`Server is running on the port ${port}`)
})


//intitialising prismsa client
