import {CrowdinPhraseResponse} from "./crowdin-phrase-response";

import {getFetchParams} from "../../../util/getFetchParams";

export async function getSinglePhrase(projectId: number, languageId: number, stringId: number): Promise<CrowdinPhraseResponse> {
    return await fetch(getPhraseUrl(projectId, languageId, stringId), getFetchParams())
        .then(r => {
            if (r.status !== 200) {
                throw new Error("User does not have access!")
            }
            return r;
        })
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinPhraseResponse)
}

function getPhraseUrl(projectId: number, languageId: number, stringId: number) {
    return `${window.location.origin}/backend/translation/phrase?project_id=${projectId}&target_language_id=${languageId}&translation_id=${stringId}`;
}
