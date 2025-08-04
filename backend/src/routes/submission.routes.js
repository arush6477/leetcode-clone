import Router from "express"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = Router()

import {
    getAllSubmissions,
    getSubmissionsForProblems,
    getAllTheSubmissionsForProblem
} from "../controllers/submission.controller.js"

router.route("/get-all-submissions").get(verifyToken, getAllSubmissions)
router.route("/get-submission/:problemId").get(verifyToken, getSubmissionsForProblems)
router.route("/get-submissions-count/:problemId").get(verifyToken,  getAllTheSubmissionsForProblem)


export default router