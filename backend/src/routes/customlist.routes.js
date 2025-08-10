import Router from "express"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = Router()

import {
    createList,
    getAllLists,
    getListDetails,
    addProblemToPlaylist,
    deleteList,
    removeProblemFromPlaylist
} from "../controllers/customlist.controller.js"

router.route("/").get(verifyToken, getAllLists)
router.route("/create").post(verifyToken, createList)
router.route("/:listId").get(verifyToken, getListDetails)
router.route("/:listId/add-problem").post(verifyToken, addProblemToPlaylist)
router.route("/:listId").delete(verifyToken, deleteList)
router.route("/:listId/remove-problem").delete(verifyToken, removeProblemFromPlaylist)

export default router