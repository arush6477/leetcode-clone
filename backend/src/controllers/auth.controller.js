import { asyncHandler } from "../utils/asyncHandler.js"
import { db } from "../libs/db.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import bcrypt from "bcryptjs"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"
import { transporter } from "../utils/nodemailer.js"

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body

    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        console.log("existingUser from register controller", existingUser)

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
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        role: newUser.role,
                        image: newUser.image
                    }
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

    console.log("Email: ", email)
    console.log("password: ", password)

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
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image
                    }
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
        res.json(new ApiResponse(200, { user: req.user }, "user is authenticated"))
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


const requestToken = asyncHandler(async (req, res) => {
    try {
        const email = req.params.email

        if (!email) {
            throw new ApiError(401, "provide email in the params")
        }

        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        if (!token) {
            throw new ApiError(500, "failed making the token")
        }


        const mailOptions = {
            to: user.email,
            from: process.env.NODEMAILER_EMAIL,
            subject: 'Password Reset Request',
            text: `Hi ${user.name},\n\nWe received a request to reset your password.\n\nPlease use the token below to reset your password:\n${token}\n\nIf you did not request this, please ignore this email. Your password will remain unchanged.\n\nThanks,  \n[Your App Name] Team`,
        }

        const sendMailToken = await transporter.sendMail(mailOptions)

        if (!sendMailToken) {
            throw new ApiError(500, "Failed to send the email")
        }

        return res.json(
            new ApiResponse(200, {}, "token sent successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while sending the token" + error.message)
    }
})


const forgotPassword = asyncHandler(async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const token = req.params.token

        if (!email || !newPassword || !token) {
            throw new ApiError(401, "email or password msiisng in the body")
        }

        const user = await db.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new ApiError(404, "user does not exist")
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) {
            throw new ApiError(401, "invalid token!!!!!")
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        const updateDatabase = await db.user.update({
            where: {
                email
            },
            data: {
                password: hashPassword
            }
        })

        if (!updateDatabase) {
            throw new ApiError(500, "failed to update the password")
        }
        updateDatabase.password = hashPassword
        return res.json(
            new ApiResponse(200, updateDatabase, "password updated successfully")
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong: " + error.message)
    }
})

export {
    registerUser,
    loginUser,
    logOut,
    checkUser,
    changePassword,
    forgotPassword,
    requestToken
}