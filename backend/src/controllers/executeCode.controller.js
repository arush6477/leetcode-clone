import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { db } from "../libs/db.js"
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js"
import { getLanguageName } from "../libs/judge0.lib.js"

const executeCode = asyncHandler(async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problem_id } = req.body

        const userId = req.user.id

        // Validate testCases
        if (
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length === 0
        ) {
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

        // judge0 return tokens as response for batch submission
        const tokens = submitResponse.map((res) => (res.token))

        // poll to get the status using tokens
        const results = await pollBatchResults(tokens)

        console.log("Results from judge0:", results)

        // analyze results (much needed for error handling)
        let allPassed = true
        const detailedResults = results.map((result, index) => {
            const stdout = result.stdout?.trim()
            const expected_output = expected_outputs[index]?.trim()
            const passed = stdout === expected_output
            // console.log(`Testcase #${index+1}`)
            // console.log(`Input for ${stdin[index]}`)
            // console.log(`Expected output for the testcase ${expected_output}`)
            // console.log(`Actual output ${stdout}`)
            // console.log(`Matched ${passed}`)

            if (!passed) {
                allPassed = false
            }

            return {
                testCase: index + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined
            }
        })
        console.log(detailedResults)

        // if(!allPassed){
        //     throw new ApiError(400,"some testcase failed")
        // }


        const submission = await db.submission.create({
            data: {
                userId: userId,
                problemId: problem_id,
                language: getLanguageName(language_id),
                sourceCode: source_code,
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map(res => res.stdout).join("\n")),
                stderr: detailedResults.some((res) => res.stderr)
                    ? JSON.stringify(detailedResults.map(res => res.stderr).join("\n")) : null,
                compileOutput: detailedResults.some((res) => res.compile_output)
                    ? JSON.stringify(detailedResults.map(res => res.compile_output).join("\n")) : null,
                status: allPassed ? "ACCEPTED" : "REJECTED",
                time: detailedResults.some((res) => res.time)
                    ? JSON.stringify(detailedResults.map(res => res.time).join("\n")) : null,
                memory: detailedResults.some((res) => res.memory)
                    ? JSON.stringify(detailedResults.map(res => res.memory).join("\n")) : null,
            }
        })

        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId, problemId: problem_id
                    }
                },
                update: {

                },
                create: {
                    userId, problemId: problem_id
                }
            })
        }

        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }));

        await db.testCaseResult.createMany({
            data: testCaseResults,
        });

        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id,
            },
            include: {
                testCases: true,
            },
        });

        return res.json(
            new ApiResponse(200, { submission: submissionWithTestCase }, "Code executed successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Internal Server Error" + error.message)
    }
})

export {
    executeCode
}