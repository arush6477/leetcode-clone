const getjudge0LanguageId = (language) => {
    const languageMap = {
        "python": 71,
        "javascript": 63,
        "java": 62,
        "c++": 54
    }

    return languageMap[language.toUpperCase()]
}

const submitBatch = async (submissions) => {
    const { data } = await axios.post(`${process.env.JUDGE0_API_URL}submissions/batch?base64_encoded=false`,{
        submissions: submissions
    })

    console.log("Submission Results:", data)

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
            result.ststus.id !== 1 && result.status.id !== 2
        })

        if(isAllDone) {
            return results
        }

        // call after every 1 sec 
        await sleep(1000) 
    }
}

export {
    getjudge0LanguageId,
    submitBatch,
    pollBatchResults
}