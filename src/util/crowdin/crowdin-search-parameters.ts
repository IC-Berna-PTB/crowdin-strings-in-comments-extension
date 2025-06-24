import {
    getFileId,
    getCurrentLanguageId,
    getProjectId,
    getSearchQuery
} from "./api/crowdin-api-client";

export enum CrowdinSearchQueryType {
    ADVANCED_FILTERING = 12,
    CROQL_FILTERING = 38,

    SHOW_ALL = 3,
    UNTRANSLATED_FIRST = 0,
    UNTRANSLATED_ONLY = 2,
    NOT_APPROVED_ONLY = 5,
    APPROVED_ONLY = 4,
    UNSAVED_TRANSLATIONS = 39,

    QA_ISSUES__WITHOUT_QA_CHECKS = 33,
    QA_ISSUES__ALL = 18,
    QA_ISSUES__EMPTY_TRANSLATION = 19,
    QA_ISSUES__VARIABLES_MISMATCH = 20,
    QA_ISSUES__TAGS_MISMATCH = 21,
    QA_ISSUES__PUNCTUATION_MISMATCH = 22,
    QA_ISSUES__CHARACTER_CASE_MISMATCH = 23,
    QA_ISSUES__SPACES_MISMATCH = 24,
    QA_ISSUES__LENGTH_ISSUES = 25,
    QA_ISSUES__SPECIAL_CHARACTERS_MISMATCH = 26,
    QA_ISSUES__INCORRECT_TRANSLATION_ISSUES = 27,
    QA_ISSUES__SPELLING_MISTAKES = 28,
    QA_ISSUES__ICU_SYNTAX = 29,
    QA_ISSUES__DUPLICATE_TRANSLATION = 35,
    QA_ISSUES__FTL_SYNTAX = 36,
    QA_ISSUES__NUMBERS_MISMATCH = 40,

    MACHINE_TRANSLATIONS__ALL = 10,
    MACHINE_TRANSLATIONS__TRANSLATION_MEMORY = 30,
    MACHINE_TRANSLATIONS__MACHINE_TRANSLATION = 31,
    MACHINE_TRANSLATIONS__ARTIFICIAL_INTELLIGENCE = 41,

    WITH_COMMENTS = 7,
    WITH_UNRESOLVED_ISSUES__ALL_LANGUAGES = 13,
    WITH_UNRESOLVED_ISSUES__CURRENT_LANGUAGE = 17,
}

export enum CrowdinSortMethod {
    ORIGINAL_SORT_ORDER = 0,
    STRINGS_ADDED = 1,
    TRANSLATIONS_UPDATED = 2,
    LAST_COMMENT_ADDED = 3,
    ALPHABET = 4,
    LENGTH = 5,
    VOTES = 6,
}
export type CrowdinSearchScope = "everything" | "strings" | "context" | "translations" | "key"

const crowdinSearchScopeToOption: Map<CrowdinSearchScope, number> = new Map();
crowdinSearchScopeToOption.set("everything", 0)
crowdinSearchScopeToOption.set("strings", 1)
crowdinSearchScopeToOption.set("context", 2)
crowdinSearchScopeToOption.set("translations", 3)
crowdinSearchScopeToOption.set("key", 4)

export abstract class CrowdinSearchParameters {
    filter: CrowdinSearchQueryType
    project_id: number
    target_language_id: number
    file_id: number | "all"
    page: number
    query: string
    custom_filter: CustomFilter


    constructor(filter: CrowdinSearchQueryType, project_id: number, file_id: number | "all", target_language_id: number, page: number, query: string) {
        this.filter = filter;
        this.project_id = project_id;
        this.target_language_id = target_language_id;
        this.file_id = file_id;
        this.page = page;
        this.query = query;
    }

    static async generateFromUrl(url: string): Promise<CrowdinSearchParameters> {
        const parsedUrl = new URL(url);
        const urlSearchParams = parsedUrl.searchParams;
        const projectId = getProjectId(parsedUrl);
        const fileId = getFileId(parsedUrl);
        const targetLanguageId = await getCurrentLanguageId(projectId);
        const query = getSearchQuery(parsedUrl);

        switch (urlSearchParams.get("filter") as "basic" | "advanced" | "croql") {
            case "basic":
                return CrowdinSearchParametersBasic.generateFromSearchParams(urlSearchParams, projectId, fileId, targetLanguageId, query);
            case "advanced":
                return CrowdinSearchParametersAdvanced.generateFromSearchParams(urlSearchParams, projectId, fileId, targetLanguageId, query);
            case "croql":
                return CrowdinSearchParametersCroQL.generateFromSearchParams(urlSearchParams, projectId, fileId, targetLanguageId, query);
        }
    }

}

export class CrowdinSearchParametersBasic extends CrowdinSearchParameters {

    private search_option: number
    search_strict = false //  Called "Exact match" in the web UI
    search_full_match = false // Called "Match whole phrase" in the web UI
    case_sensitive = false // Called "Match case" in the web UI
    custom_filter = new CustomFilter()
    set search_scope(search_scope: CrowdinSearchScope) {
        this.search_option = crowdinSearchScopeToOption.get(search_scope)
    }

    static generateFromSearchParams(params: URLSearchParams, projectId: number, fileId: number | "all", targetLanguageId: number, query: string): CrowdinSearchParametersBasic {
        const result = new CrowdinSearchParametersBasic(+params.get("value"), projectId, fileId, targetLanguageId, 1, query);
        result.search_scope = params.get("search_scope") as CrowdinSearchScope;
        result.case_sensitive = +params.get("case_sensitive") !== 0;
        result.search_full_match = +params.get("search_full_match") !== 0;
        result.search_strict = +params.get("search_strict") !== 0;
        return result;
    }

}

type CrowdinTranslationFilter =
    "updated"
    | "partially_translated"
    | "translated"
    | "duplicate_source_string"
    | "modified_source_strings";

type CrowdinApprovalFilter =
    "translated_not_approved"
    | "partially_approved"
    | "approved"
    | "have_translations_after_approval";

type CrowdinApprovalCountSelectFilter = "approvals_greater_than" | "approvals_less_than";

type CrowdinTmAndMtFilter = "by_mt" | "by_tm" | "by_ai" | "by_mt_or_tm";

type CrowdinPreTranslationFilter = "used" | "not_used";

type CrowdinCommentsFilter =
    "do_not_have_comments"
    | "have_comments"
    | "have_unresolved_issues"
    | "has_unresolved_issues_general"
    |
    "has_unresolved_issues_poor_translation"
    | "has_unresolved_issues_lack_context"
    | "has_unresolved_issues_wrong_source";

type CrowdinScreenshotsFilter = "without_screenshots" | "with_screenshots";

type CrowdinStringTypeFilter = "string_type_simple" | "string_type_plurals" | "string_type_icu";

type CrowdinVoteFilter = "votes_greater_than" | "votes_less_than";

export class CrowdinSearchParametersAdvanced extends CrowdinSearchParameters {


    constructor(project_id: number, file_id: number | "all", target_language_id: number, page: number, query: string) {
        super(CrowdinSearchQueryType.ADVANCED_FILTERING, project_id, file_id, target_language_id, page, query);
    }

    custom_filter = new CustomFilterAdvanced()

    static generateFromSearchParams(params: URLSearchParams, projectId: number, fileId: "all" | number, targetLanguageId: number, query: string): CrowdinSearchParametersAdvanced {
        const result = new CrowdinSearchParametersAdvanced(projectId, fileId, targetLanguageId, 1, query);
        result.custom_filter.added_from = params.get("added_from")
        result.custom_filter.added_to = params.get("added_to")
        result.custom_filter.updated_from = params.get("updated_from")
        result.custom_filter.updated_to = params.get("updated_to")
        result.custom_filter.changed_from = params.get("changed_from")
        result.custom_filter.changed_to = params.get("changed_to")

        result.custom_filter.verbal_expression_scope = params.get("verbal_expression_scope") as CrowdinSearchScope
        result.custom_filter.verbal_expression = params.get("verbal_expression")

        result.custom_filter.translations = params.get("translations") as CrowdinTranslationFilter
        result.custom_filter.approvals = params.get("approvals") as CrowdinApprovalFilter
        result.custom_filter.approvals_count_select = params.get("approvals_count_select") as CrowdinApprovalCountSelectFilter
        result.custom_filter.approvals_count = +params.get("approvals_count")
        result.custom_filter.tm_and_mt = params.get("tm_and_mt") as CrowdinTmAndMtFilter
        result.custom_filter.pre_translation = params.get("pre_translation") as CrowdinPreTranslationFilter
        result.custom_filter.comments = params.get("comments") as CrowdinCommentsFilter
        result.custom_filter.screenshots = params.get("screenshots") as CrowdinScreenshotsFilter
        result.custom_filter.qa_issues = params.get("qa_issues") as CrowdinSearchScope
        result.custom_filter.string_type = params.get("string_type") as CrowdinStringTypeFilter
        result.custom_filter.votes = params.get("votes") as CrowdinVoteFilter
        result.custom_filter.votes_count = +params.get("votes_count")
        result.custom_filter.translated_by_user = params.get("translated_by_user")
        result.custom_filter.not_translated_by_user = params.get("not_translated_by_user")
        result.custom_filter.approved_by_user = params.get("approved_by_user")
        result.custom_filter.not_approved_by_user = params.get("not_approved_by_user")
        result.custom_filter.sort_method = +params.get("sort_method") as CrowdinSortMethod
        result.custom_filter.sort_ascending = +params.get("sort_ascending") !== 0
        return result;
    }
}

export class CrowdinSearchParametersCroQL extends CrowdinSearchParameters {
    constructor(project_id: number, file_id: number | "all", target_language_id: number, page: number, query: string) {
        super(CrowdinSearchQueryType.CROQL_FILTERING, project_id, file_id, target_language_id, page, query);
    }

    custom_filter = new CustomFilterCroQL();

    static generateFromSearchParams(params: URLSearchParams, projectId: number, fileId: "all" | number, targetLanguageId: number, query: string): CrowdinSearchParametersCroQL {
        const result = new CrowdinSearchParametersCroQL(projectId, fileId, targetLanguageId, 1, query);
        result.custom_filter.croql_expression = params.get("croql_expression")
        result.custom_filter.ai_query = params.get("ai_query")
        return result;
    }
}

class CustomFilter {

    toString() {
        return JSON.stringify({});
    }

}

class CustomFilterAdvanced extends CustomFilter {

    added_from?: string
    added_to?: string
    updated_from?: string
    updated_to?: string
    changed_from?: string
    changed_to?: string

    verbal_expression_scope?: CrowdinSearchScope
    verbal_expression?: string

    translations?: CrowdinTranslationFilter
    approvals?: CrowdinApprovalFilter
    approvals_count_select?: CrowdinApprovalCountSelectFilter
    approvals_count?: number
    tm_and_mt?: CrowdinTmAndMtFilter // The last one includes AI
    pre_translation?: CrowdinPreTranslationFilter
    comments?: CrowdinCommentsFilter
    screenshots?: CrowdinScreenshotsFilter
    qa_issues?: CrowdinSearchScope
    string_type?: CrowdinStringTypeFilter
    votes?: CrowdinVoteFilter
    votes_count?: number
    translated_by_user?: string
    not_translated_by_user?: string
    approved_by_user?: string
    not_approved_by_user?: string
    sort_method?: CrowdinSortMethod
    sort_ascending?: boolean


    toString(): string {
        return JSON.stringify(this);
    }
}

class CustomFilterCroQL extends CustomFilter {
    croql_expression?: string
    ai_query?: string

    toString(): string {
        return JSON.stringify(this);
    }
}
