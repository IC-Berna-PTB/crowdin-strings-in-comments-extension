import {ReferencedString} from "../../../module/strings-in-comments/reference/string/referenced-string";
import {getFetchParams} from "../../util";
import {CrowdinPhraseResponse} from "./phrase-response/crowdin-phrase-response";
import {
    fromPhrasesResponseDataPhrase,
    ReferencedStringActual
} from "../../../module/strings-in-comments/reference/string/referenced-string-actual";
import {CrowdinInitResponse} from "./init-response/crowdin-init-response";
import {
    ReferencedSearchQuery
} from "../../../module/strings-in-comments/reference/search-query/referenced-search-query";
import {CrowdinPhrasesResponse} from "./phrases-request/crowdin-phrases-response";
import {
    ReferencedSearchQueryActual
} from "../../../module/strings-in-comments/reference/search-query/referenced-search-query-actual";
import {
    CrowdinSearchParametersBasic
} from "../crowdin-search-parameters";

export async function getPhrase(referencedString: ReferencedString): Promise<ReferencedString> {
    return await fetch(getPhraseUrl(referencedString.getProjectId(), await getCurrentLanguageId(), referencedString.getStringId()), getFetchParams())
        .then(r => {
            if (r.status !== 200) {
                throw new Error("User does not have access!")
            }
            return r;
        })
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinPhraseResponse)
        .then(r => r.data)
        .then(async r => {
            if (r.success) {
                return new ReferencedStringActual(referencedString.getProjectId(),
                    referencedString.getStringId(),
                    r.translation.text,
                    r.top_suggestion,
                    (r.translation_status.approved ? "approved" : (r.translation_status.translated ? "translated" : "not-translated")),
                    r.translation.key,
                    r.translation.file_path)
            } else if (referencedString.getFallbackKey()) {
                const fallbackResult = await getFallback(CrowdinSearchParametersBasic.generateFromReferencedString(referencedString, await getCurrentLanguageId()));
                if (fallbackResult) {
                    return fallbackResult;
                }
            }
            throw new Error(`Could not retrieve translation for project ${referencedString.getProjectId()} and string ${referencedString.getStringId()}`)
        })
        .catch(() => null)

}


export async function getFallback(searchParameters: CrowdinSearchParametersBasic): Promise<ReferencedStringActual> {
    searchParameters.search_scope = "key";
    searchParameters.search_strict = true;
    let fallbackResponse = await getPhrases(new ReferencedSearchQuery(searchParameters.project_id,
        searchParameters, searchParameters.url));
    if (fallbackResponse.totalResults === 1) {
        return fallbackResponse.results[0];
    }
    return null;
}

function getPhrasesUrl() {
    return `${window.location.origin}/backend/phrases`;
}

function append(body: URLSearchParams, entry: [string, any]) {
    body.append(entry[0], entry[1].toString());
}

export async function getPhrases(referencedSearchQuery: ReferencedSearchQuery): Promise<ReferencedSearchQueryActual> {
    let parameters = getFetchParams();
    const body = new URLSearchParams();
    Object.entries(referencedSearchQuery.getSearchParameters()).forEach(entry => append(body, entry))
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
        .then(r => r.data)
        .then(r => new ReferencedSearchQueryActual(referencedSearchQuery.getSearchParameters().project_id,
            referencedSearchQuery.getSearchParameters(), referencedSearchQuery.getOriginalUrl(),
            r.phrases.map(p => fromPhrasesResponseDataPhrase(p, referencedSearchQuery)), r.found))
}

function getPhraseUrl(projectId: number, languageId: number, stringId: number) {
    return `${window.location.origin}/backend/translation/phrase?project_id=${projectId}&target_language_id=${languageId}&translation_id=${stringId}`;
}

export function getProjectId(url: URL): number {
    return parseInt(url.pathname.split("/")[2])
}

export function getCurrentProjectId(): number {
    return getProjectId(new URL(window.location.href))
}

export function getFileId(url: URL): number | "all" {
    const fileId = url.pathname.split("/")[3];
    return fileId === "all" ? fileId : parseInt(fileId);
}

export function getCurrentFileId(): number | "all" {
    return getFileId(new URL(window.location.href));
}

export function getSearchQuery(url: URL): string {
    return url.hash.replace("#q=", "")
}

export async function getCurrentLanguageId(): Promise<number> {
    const languages = window.location.pathname.split("/")[4];
    if (languages != lastLanguages) {
        return fetch(`${window.location.origin}/backend/editor/init?editor_mode=translate&project_id=${getCurrentProjectId()}&file_id=all&languages=${languages}`, getFetchParams())
            .then(r => r.text())
            .then(r => JSON.parse(r) as CrowdinInitResponse)
            .then(r => r.data)
            .then(r => r.init_editor)
            .then(r => r.target_language ?? r.out_of_scope_target_lang)
            .then(r => r.id)
            .then(r => {
                lastLanguageId = r;
                lastLanguages = languages;
                return;
            })
            .then(() => lastLanguageId)
    } else {
        return lastLanguageId;
    }

}

let lastLanguages: string = "";
let lastLanguageId: number = -1;
