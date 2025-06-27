import {CrowdinSearchParameters} from "../../../util/crowdin/crowdin-search-parameters";

export class CrowdinPhrasesRequest {
    project_id: number
    target_language_id: number
    file_id: number
    page: number
    custom_filter: CrowdinSearchParameters
    query: string
    request: number
    search_option: number
    case_sensitive: boolean
    search_full_match: boolean
    search_strict: boolean
    view_in_context: boolean
}
