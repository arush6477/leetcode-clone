import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { db } from "../libs/db.js"

const getAllSubmissions = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id

        const submission = await db.submission.findMany({
            where: {
                userId: userId
            }
        })

        res.json(
            new ApiResponse(200, submission, "All submissions fetched successfully")
        )

    } catch (error) {
        throw new ApiError(500, "Error fetching submissions: " + error.message)
    }
})

const getSubmissionsForProblems = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id
        const { problemId } = req.params

        if(!problemId) throw new ApiError(400, "problemId not found in the params");

        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            }
        })


        if(submissions.length === 0) {
            throw new ApiError(404,"No submission for the given user or problem")
        }

        return res.json(
            new ApiResponse(200, submissions, "Submissions for problem fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Error fetching submissions for problem: " + error.message)
    }
})

const getAllTheSubmissionsForProblem = asyncHandler(async (req, res) => {
    try {
        const problemId = req.params.problemId
        const submissions = await db.submission.findMany({
            where: {
                problemId: problemId
            }
        })

        return res.json(
            new ApiResponse(200, {count: submissions }, "All submissions for problem fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Error fetching all submissions for problem: " + error.message)
    }
})

export {
    getAllSubmissions,
    getSubmissionsForProblems,
    getAllTheSubmissionsForProblem
}