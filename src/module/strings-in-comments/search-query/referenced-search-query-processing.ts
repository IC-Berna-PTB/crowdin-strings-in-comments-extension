import {ReferencedSearchQuery} from "../aux-objects/reference/search-query/referenced-search-query";
import {getMultiplePhrases} from "../../../apis/crowdin/multiple-phrases/crowdin-multiple-phrases-call";
import {ReferencedSearchQueryActual} from "../aux-objects/reference/search-query/referenced-search-query-actual";
import {fromPhrasesResponseDataPhrase} from "../aux-objects/reference/string/referenced-string-actual";

export async function processReferencedSearchQuery(referencedSearchQuery: ReferencedSearchQuery): Promise<ReferencedSearchQueryActual> {
    const searchParameters = referencedSearchQuery.toCrowdinSearchParameters();
    return getMultiplePhrases(searchParameters)
        .then(r => r.data)
        .then(r => new ReferencedSearchQueryActual(searchParameters.project_id,
            searchParameters,
            referencedSearchQuery.getOriginalUrl(),
            r.phrases.map(p => fromPhrasesResponseDataPhrase(p, referencedSearchQuery)),
            r.found))

}
