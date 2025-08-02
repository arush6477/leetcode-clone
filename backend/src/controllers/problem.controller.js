import { asyncHandler } from "../utils/asyncHandler.js"
import { db } from "../libs/db.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { getjudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js"

const createProblem = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippet,
        referenceSolutions
    } = req.body

    if (req.user.role !== "ADMIN") {
        throw new ApiError(401, "not allowed to create a problem")
    }


    try {
        for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getjudge0LanguageId(language)
            if (!languageId) {
                throw new ApiError(400, `Unsupported language: ${language}`)
            }
            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))

            // array of tokens of the batch submission
            const submissionResults = await submitBatch(submissions)

            const tokens = submissionResults.map((res) => { res.token })

            const results = await pollBatchResults(tokens)

            for (let i = 0; i < results.length; i++) {
                const result = results[i]
                if (result.status.id !== 3) {
                    throw new ApiError(400, `Test case ${i + 1} failed for language ${language}: ${result.status.description}`)
                }
            }
        }

        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippet,
                referenceSolutions,
                userId: req.user.id
            }
        })

        return res
            .json(
                new ApiResponse(201, newProblem, "Problem created successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Error creating problem: " + error.message)
    }
})

const getAllProblems = asyncHandler(async (req, res) => { })

const getProblemById = asyncHandler(async (req, res) => { })

const updateProblem = asyncHandler(async (req, res) => { })

const deleteProblem = asyncHandler(async (req, res) => { })

const getAllProblemsSolvedByUser = asyncHandler(async (req, res) => { })

export {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getAllProblemsSolvedByUser
}