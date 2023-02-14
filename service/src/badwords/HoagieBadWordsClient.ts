import { BadWordsResponse } from "./BadWordsClient";
import { hardcodedBadWordsList } from "./HardcodedBadWordsList";

const regexString = `\\b(?<badword>${hardcodedBadWordsList.join("|")})\\b`

export default class HoagieBadWordsClient {
    public eval(text: string): BadWordsResponse {
        const regex = new RegExp(regexString, "g")
        const matches = [...text.toLowerCase().matchAll(regex)]
       
        const wordList = matches.map(match => ({
            original: match.groups?.badword ?? "",
            word: match.groups?.badword ?? ""
        }))

        return {
            bad_words_list: wordList,
            status: {
                isError: false,
                statusCode: 200,
                statusMessage: "OK",
                api: "Hoagie"
            }
        }
    }
}