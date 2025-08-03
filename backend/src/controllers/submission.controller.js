import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiError.js"
import db from "../libs/db.js"

const somefunction = asyncHandler(async (req, res) => { })

export {
    somefunction
}