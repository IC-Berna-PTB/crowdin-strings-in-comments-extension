import {ReferencedString} from "../aux-objects/reference/string/referenced-string";
import {getCurrentLanguageId} from "../../../apis/crowdin/crowdin-aux-functions";
import {ReferencedStringActual} from "../aux-objects/reference/string/referenced-string-actual";
import {CrowdinPhraseResponse} from "../../../apis/crowdin/single-phrase/crowdin-phrase-response";
import {getSinglePhrase} from "../../../apis/crowdin/single-phrase/crowdin-single-phrase-call";
import {CrowdinSearchParametersBasic} from "../../../util/crowdin/crowdin-search-parameters";
import {ReferencedSearchQuery} from "../aux-objects/reference/search-query/referenced-search-query";
import {processReferencedSearchQuery} from "../search-query/referenced-search-query-processing";

export async function processReferencedString(referencedString: ReferencedString): Promise<ReferencedString> {
    return await getSinglePhrase(referencedString.getProjectId(), await getCurrentLanguageId(), referencedString.getStringId())
        .then(r => processExactIdResponse(r, referencedString))
        .catch(() => ifExactIdDoesntExist(referencedString))
        .then(r => r)
        .catch(() => null)
}


function processExactIdResponse(exactIdResponse: CrowdinPhraseResponse, referencedString: ReferencedString): ReferencedStringActual | undefined {
    if (exactIdResponse.data.success) {
        const r = exactIdResponse.data;
        return new ReferencedStringActual(referencedString.getProjectId(),
            referencedString.getStringId(),
            r.translation.text,
            r.top_suggestion,
            (r.translation_status.approved ? "approved" : (r.translation_status.translated ? "translated" : "not-translated")),
            r.translation.key,
            r.translation.file_path)
    }
    throw new Error(`Error while processing referenced string ${JSON.stringify(referencedString)}`)
}

async function ifExactIdDoesntExist(referencedString: ReferencedString): Promise<ReferencedStringActual> {
    const parameters = referencedString.toCrowdinSearchParametersBasic(await getCurrentLanguageId());
    if (parameters != undefined) {
        return await getFallback(parameters);
    }
    throw new Error("The referenced string does not have a fallback key");
}

export async function getFallback(searchParameters: CrowdinSearchParametersBasic): Promise<ReferencedStringActual> {
    let fallbackResponse = await processReferencedSearchQuery(new ReferencedSearchQuery(searchParameters.project_id,
        searchParameters,
        searchParameters.url));
    if (fallbackResponse.totalResults === 1) {
        return fallbackResponse.results[0];
    }
    return null;
}
