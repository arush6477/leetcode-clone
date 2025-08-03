import Router from "express"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = Router()


import { 
    executeCode
} from "../controllers/executeCode.controller.js"

// Route 
router.route("/execute-code").post(verifyToken, executeCode)

export default router