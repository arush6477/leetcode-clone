import jwt from "jsonwebtoken"
import { db } from "../libs/db.js"
import { ApiError } from "../utils/apiError.js"

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        
        if (!token) {
            throw new ApiError(401, "unauthorized access || access denied") 
        }
        
        let decoded 
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            throw new ApiError(401, error.message)
        }

        // adding the user to the req using the id from the decoded token
        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                name: true, 
                image:true,
                role: true
            }
        })

        if(!user) { 
            throw new ApiError(401, "user does not exist")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(500, error.message)
    }
}

const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id
        const user = await db.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user || user.role !== 'ADMIN') {
            throw new ApiError(403, "Access denied")
        }
        next()
    } catch (error) {
        throw new ApiError(500, error.message)
    }
}

export { 
    verifyToken, 
    checkAdmin
}