import { asyncHandler } from "../utils/asyncHandler.js"
import { db } from "../libs/db.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { getjudge0LanguageId, submitBatch, pollBatchResults } from "../libs/judge0.lib.js"

// khatarnak controller 
// bss batch me bhejo 
// token milega 
// baar bar token bhej krr poocho hua solve ( vhi polling wala logic hai )
// sbb shii se execute hora ha to mast create krdo database me
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
        refrenceSolutions
    } = req.body

    if (req.user.role !== "ADMIN") {
        throw new ApiError(401, "not allowed to create a problem")
    }


    try {
        for (const [language, solutionCode] of Object.entries(refrenceSolutions)) {
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

            const tokens = submissionResults.map((res) => { return res.token })

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
                refrenceSolutions,
                userId: req.user.id
            }
        })

        return res
            .json(
                new ApiResponse(201, newProblem, "Problem created successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Error creating problem: " + error)
    }
})

const getAllProblems = asyncHandler(async (req, res) => { 
    try {
        // will add the conditions later
        const problems = await db.problem.findMany()

        if(!problems){
            throw new ApiError(404, "No problems found")
        }

        return res.json(
            new ApiResponse(200, problems, "All problems fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Error fetching problems: " + error.message)
    }
})

const getProblemById = asyncHandler(async (req, res) => { 
    const { id } = req.params

    try {
        const problem = await db.problem.findUnique({
            where: {
                id
            }
        })

        if(!problem) {
            throw new ApiError(404, "Problem not found")
        }

        return res.json(
            new ApiResponse(200, problem, "Problem fetched successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Error fetching problem: " + error.message)
    }
})

const updateProblem = asyncHandler(async (req, res) => { })

const deleteProblem = asyncHandler(async (req, res) => { 
    const { id } = req.params

    try {
        const problem = await db.problem.findUnique({
            where: {
                id
            }
        })

        if (!problem) {
            throw new ApiError(404, "Problem not found")
        }

        const deletedProblem = await db.problem.delete({
            where: {
                id
            }
        }) 
    
        if (!deletedProblem) {
            throw new ApiError(404, "Problem not found")
        }
        return res.json(
            new ApiResponse(200, deletedProblem, "Problem deleted successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Error deleting problem: " + error.message)
    }
})

const getAllProblemsSolvedByUser = asyncHandler(async (req, res) => { 
    const userId = req.user.id
})

export {
    createProblem,
    getAllProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
    getAllProblemsSolvedByUser
}