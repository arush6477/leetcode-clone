import { create } from "zustand"
import { axiosInstance } from "../libs/axios"
import { toast } from "react-hot-toast"

const useAuthStore = create((set) => ({
    problems: [],
    problem: null,
    solvedProblems: [],
    isProblemsLoading: false,
    isProblemLoading: false,


    getAllProblems: async () => {
        try {
            set({ isProblemsLoading: true })

            const res = await axiosInstance.get("/problems/get-all-problems")

            set({ problems: res.data.data.problems })
        } catch (error) {
            console.log("Error gettin all problems: " + error.message)
            toast.error("Error in getting problems: " + error.message)
        } finally {
            set({ isProblemLoading: true })
        }
    },

    getProblemById: async () => {
        try {
        set({isProblemLoading:true})
        
        const res = await axiosInstance.get("/problems/get-problem/" + id)
        } catch (error) {
            console.log("Error getting the problem: " + error.messgae)
            toast.error("error getting the problems")
        }finally{
            set({isProblemLoading:false})
        }

     },

    getSolvedProblemByUser: async () => { 
        try{
            const res = await axiosInstance.get("/problems/get-solved-problems") 
            set({solvedProblems:res.data.data.problems})
        }catch (error){
            console.lo
        }finally{
            set({isProblemLoading:false})

        }

    }


}))

export {
    useProblemStore
}