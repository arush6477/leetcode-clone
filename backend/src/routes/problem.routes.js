import Router from "express"
import { 
    verifyToken,
    checkAdmin 
} from "../middleware/auth.middleware.js"

const router = Router()


import { 
   createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getAllProblemsSolvedByUser
} from "../controllers/problem.controller.js"


router.route("/create-problem").post(verifyToken, checkAdmin, createProblem)
router.route("/get-all-problems").get(verifyToken, getAllProblems)
router.route("/get-problem/:id").get(verifyToken, getProblemById)
router.route("/update-problem/:id").put(verifyToken, checkAdmin, updateProblem)
router.route("/delete-problem/:id").delete(verifyToken, checkAdmin, deleteProblem)
router.route("/get-solved-problems").get(verifyToken, getAllProblemsSolvedByUser)

export default router