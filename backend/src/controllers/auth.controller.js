import { asyncHandler } from "../utils/asyncHandler.js"
import { db } from "../libs/db.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import bcrypt from "bcryptjs"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body

    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        console.log("existingUser", existingUser)

        if (existingUser) {
            throw new ApiError(401, "user already exists")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER
            }
        })

        const token = jwt.sign({
            id: newUser.id
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })


        return res
            .cookie("jwt",
                token,
                {
                    httpOnly: true,
                    sameSite: "Strict",
                    secure: process.env.NODE_ENV !== "development",
                    maxAge: 1000 * 600 * 60 * 24 * 7 // 7 days in ms
                }
            )
            .json(new ApiResponse(
                201,
                //will console log the newUser then will decide to send or not 
                // currently going with his one 
                {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    image: newUser.image
                },
                "user created successfully"
            ))
    } catch (error) {
        console.log(error)
        console.error("Error creating the user")
        throw new ApiError(500, error.message)
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new ApiError(401, "user does not exist")
        }


        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            throw new ApiError(401, "invalid credentials")
        }

        const token = jwt.sign({
            id: user.id
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        return res
            .cookie("jwt",
                token,
                {
                    httpOnly: true,
                    sameSite: "Strict",
                    secure: process.env.NODE_ENV !== "development",
                    maxAge: 1000 * 600 * 60 * 24 * 7 // 7 days in ms
                }
            )
            .json(new ApiResponse(
                201,
                //will console log the newUser then will decide to send or not 
                // currently going with his one 
                {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image
                },
                "user logged in successfully"
            ))
    } catch (error) {
        console.log(error)
        console.error("error logging in the user")
        throw new ApiError(500, error.message)
    }

})

const logOut = asyncHandler(async (req, res) => {
    try {
        res
            .clearCookie("jwt", {
                httpOnly: true,
                sameSite: "Strict",
                secure: process.env.NODE_ENV !== "development"
            })
            .json(new ApiResponse(204, null, "user logged out successfully"))
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

const checkUser = asyncHandler(async (req, res) => {
    try {
        res.json(new ApiResponse(200, req.user, "user is authenticated"))
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})

const changePassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body

        const userId = req.user.id

        const findDatabase = await db.user.findUnique({
            where: {
                id: userId
            }
        })

        const isMatch = await bcrypt.compare(oldPassword, findDatabase.password)

        if (!isMatch) {
            throw new ApiError(401, "old password is incorrect")
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        const changeDatabase = await db.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashPassword
            }
        })

        if (!changeDatabase) {
            throw new ApiError(500, "failed to update in the db")
        }

        return res.json(
            new ApiResponse(200, {}, "password changed successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong: " + error.message)
    }
})

const forgotPassword = asyncHandler(async (req,res) => {

})

export {
    registerUser,
    loginUser,
    logOut,
    checkUser
}