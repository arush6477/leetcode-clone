import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { db } from "../libs/db.js";

const createList = asyncHandler(async (req, res) => {
    try {
        const { name , description } = req.body;
        console.log(req.body)
        const userId = req.user.id;

        if (!name  || !description) {
            throw new ApiError(401, "name  or description are missing");
        }

        const createList = await db.customList.create({
            data: {
                name ,
                description,
                userId,
            },
        });

        if (!createList) {
            throw new ApiError(500, "failed to create the list");
        }

        return res.json(
            new ApiResponse(200, createList, "list created successfully")
        );
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while creating the list: " + error.message
        );
    }
});

const getAllLists = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        const getListDatabase = await db.customList.findMany({
            where: {
                usedId: userId,
            },
            include: {
                problems: {
                    include: {
                        problem: true,
                    },
                },
            },
        });

        if (!getListDatabase) {
            throw new ApiError(500, "failed to crate a entry in the database");
        }

        return res.json(
            new ApiResponse(200, getListDatabase, "lists fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "somsething went wrong" + error.message);
    }
});

const getListDetails = asyncHandler(async (req, res) => {
    try {
        const { listId } = req.params;

        const getDatabase = await db.customList.findUnique({
            where: {
                id: listId,
            },
            include: {
                problems: {
                    include: {
                        problem: true,
                    },
                },
            },
        });

        if (!getDatabase) {
            throw new ApiError(500, "error fetching the details");
        }

        return res.json(
            new ApiResponse(
                200,
                getDatabase,
                "details for the list fetched successfully"
            )
        );
    } catch (error) {
        throw new ApiError(500, "something went wrong: " + error.message);
    }
});

const addProblemToPlaylist = asyncHandler(async (req, res) => {
    try {
        const { listId } = req.params;
        const { problemIds } = req.body;

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            throw new ApiError(400, "something went wrong with problemIds");
        }

        console.log(
            problemIds.map((problemId) => ({
                listId,
                problemId,
            }))
        );

        const problemsInPlaylist = await db.problemCustomList.createMany({
            data: problemIds.map((problemId) => ({
                CustomListId: listId,
                problemId,
            })),
        });

        if (!problemsInPlaylist) {
            throw new ApiError(
                500,
                "Something went wrong while creating in database"
            );
        }

        return res.json(
            new ApiResponse(200, problemsInPlaylist, "created successfully")
        );
    } catch (error) {
        throw new ApiError(500, "something went wrong: " + error.message);
    }
});

const deleteList = asyncHandler(async (req, res) => {
    try {
        const { listId } = req.params;

        if (!listId) {
            throw new ApiError(400, "listId not found");
        }

        const deleteDatabase = await db.problemCustomList.delete({
            where: {
                id: listId,
            },
        });

        if (!deleteDatabase) {
            throw new ApiError(500, "failed to delete in the database");
        }

        return res.json(
            new ApiResponse(201, deleteDatabase, "deleted from the database successfully")
        );
    } catch (error) {
        throw new ApiError(500, "something went wrong: " + error.message);
    }
});

const removeProblemFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const { listId } = req.params;
        const { problemIds } = req.body;

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            throw new ApiError(401,"problemId is not an array")
        }

        const deletedProblem = await db.problemInPlaylist.deleteMany({
            where: {
                listId,
                problemId: {
                    in: problemIds,
                },
            },
        });

        return res.json(
            new ApiResponse(201, deletedProblem, "deleted successfully")
        );
    } catch (error) {
        throw new ApiError(500,"something went wrong: " + error.message)
    }
});

export {
    createList,
    getAllLists,
    getListDetails,
    addProblemToPlaylist,
    deleteList,
    removeProblemFromPlaylist,
};
