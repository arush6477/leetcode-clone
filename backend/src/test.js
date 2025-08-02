import { ApiError } from "./utils/apiError"

for(csont [language, solutionCode] of Object.entries(refrenceSolutions)){
    const languageId = getjudge0LanguageId(language)

    if(!languageId) {
        throw new ApiError(400, `Unsupported language: ${language}`)
    }
}