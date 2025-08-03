import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { db } from "../libs/db.js"
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js"

const executeCode = asyncHandler(async (req, res) => {
    try {
        const {source_code, language_id, stdin, expected_outputs, problem_id } = req.body

        const userId = req.user.id

        // Validate testCases
        if(
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length === 0
        ){
            throw new ApiError(400, "Invalid input stdin and expected_outputs must be non-empty arrays") 
        }

        // judge0 batch prep
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input
        }))

        // judge0 batch sending
        const submitResponse = await submitBatch(submissions)

        const tokens = submitResponse.map((res)=>(res.token))

        // poll to get the status using tokens
        const results = await pollBatchResults(tokens)

        console.log("Results from judge0:", results)

        return res.json(
            new ApiResponse(200, "Code executed successfully", {
                results: results,
                problemId: problem_id,
                userId: userId
            })
        )

    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error.message)
    }
})

export {
    executeCode
}