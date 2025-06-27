import {CrowdinPhrasesResponse} from "./crowdin-phrases-response";
import {getFetchParams} from "../../../util/getFetchParams";
import {CrowdinSearchParameters} from "../../../util/crowdin/crowdin-search-parameters";

/**
 * Makes a call to the internal `/backend/phrases` POST method of the current Crowdin instance,
 * using the {@link searchParameters} as the body.
 * @param searchParameters the search parameters to be used in the request.
 */
export async function getMultiplePhrases(searchParameters: CrowdinSearchParameters): Promise<CrowdinPhrasesResponse> {
    let parameters = getFetchParams();
    const body = new URLSearchParams();
    Object.entries(searchParameters).forEach(entry => append(body, entry))
    parameters.body = body.toString();
    (parameters.headers as Headers).append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
    parameters.method = "POST";
    return await fetch(getPhrasesUrl(), parameters)
        .then(r => {
            if (r.status !== 200) {
                throw new Error("User does not have access!")
            }
            return r;
        })
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinPhrasesResponse)
}


function getPhrasesUrl() {
    return `${window.location.origin}/backend/phrases`;
}

function append(body: URLSearchParams, entry: [string, any]) {
    body.append(entry[0], entry[1].toString());
}
