import axios from "axios"

const sleep  = (ms)=> new Promise((resolve)=> setTimeout(resolve , ms))

const getjudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "JAVA": 62,
        "C++": 54
    }

    return languageMap[language.toUpperCase()]
}

const submitBatch = async (submissions) => {
    const { data } = await axios.post(`${process.env.JUDGE0_API_URL}submissions/batch?base64_encoded=false`,{
        submissions: submissions
    })

    return data // array of tokens
}

const pollBatchResults = async (tokens) => {
    while (true) {
        const { data } = await axios.get(`${process.env.JUDGE0_API_URL}submissions/batch`,{
            params: {
                tokens: tokens.join(","),
                base64_encoded: false,
            }
        })

        const results = data.submissions

        const isAllDone = results.every((result) => {
            return result.status.id !== 1 && result.status.id !== 2
        })

        if(isAllDone) {
            return results
        }

        // tp call after every 1 sec 
        await sleep(1000) 
    }
}

const getLanguageName = (languageId) => {
    const languageMap = {
        71: "PYTHON",
        63: "JAVASCRIPT",
        62: "JAVA",
        54: "C++"
    }
    return languageMap[languageId]
}

export {
    getjudge0LanguageId,
    submitBatch,
    pollBatchResults,
    getLanguageName
}