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
type CrowdinSearchScope = "everything" | "strings" | "context" | "translations" | "key"

const crowdinSearchScopeToOption: Map<CrowdinSearchScope, number> = new Map();
crowdinSearchScopeToOption.set("everything", 0)
crowdinSearchScopeToOption.set("strings", 1)
crowdinSearchScopeToOption.set("context", 2)
crowdinSearchScopeToOption.set("translations", 3)
crowdinSearchScopeToOption.set("key", 4)

export abstract class CrowdinSearchQueryParams {
    filter: CrowdinSearchQueryType


    constructor(value: CrowdinSearchQueryType) {
        this.filter = value
    }

    static generateFromUrl(url: string): CrowdinSearchQueryParams {
        const urlSearchParams = URL.parse(url).searchParams;
        switch (urlSearchParams.get("filter") as "basic" | "advanced" | "croql") {
            case "basic":
                return CrowdinBasicSearchQueryParams.generateFromSearchParams(urlSearchParams);
            case "advanced":
                return CrowdinAdvancedSearchQueryParams.generateFromSearchParams(urlSearchParams);
            case "croql":
                return CrowdinCroQLSearchQueryParams.generateFromSearchParams(urlSearchParams);
        }
    }

}

export class CrowdinBasicSearchQueryParams extends CrowdinSearchQueryParams {


    constructor(value: CrowdinSearchQueryType) {
        super(value)
    }

    private search_option: number
    search_strict = false //  Called "Exact match" in the web UI
    search_full_match = false // Called "Match whole phrase" in the web UI
    case_sensitive = false // Called "Match case" in the web UI
    set search_scope(search_scope: CrowdinSearchScope) {
        this.search_option = crowdinSearchScopeToOption.get(search_scope)
    }

    static generateFromSearchParams(params: URLSearchParams): CrowdinBasicSearchQueryParams {
        const result = new CrowdinBasicSearchQueryParams(+params.get("value"));
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

export class CrowdinAdvancedSearchQueryParams extends CrowdinSearchQueryParams {

    constructor() {
        super(CrowdinSearchQueryType.ADVANCED_FILTERING);
    }

    added_from?: number
    added_to?: number
    updated_from?: number
    updated_to?: number
    changed_from?: number
    changed_to?: number

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

    static generateFromSearchParams(params: URLSearchParams): CrowdinAdvancedSearchQueryParams {
        const result = new CrowdinAdvancedSearchQueryParams();
        result.added_from = Date.parse(params.get("added_from"))
        result.added_to = Date.parse(params.get("added_to"))
        result.updated_from = Date.parse(params.get("updated_from"))
        result.updated_to = Date.parse(params.get("updated_to"))
        result.changed_from = Date.parse(params.get("changed_from"))
        result.changed_to = Date.parse(params.get("changed_to"))

        result.verbal_expression_scope = params.get("verbal_expression_scope") as CrowdinSearchScope
        result.verbal_expression = params.get("verbal_expression")

        result.translations = params.get("translations") as CrowdinTranslationFilter
        result.approvals = params.get("approvals") as CrowdinApprovalFilter
        result.approvals_count_select = params.get("approvals_count_select") as CrowdinApprovalCountSelectFilter
        result.approvals_count = +params.get("approvals_count")
        result.tm_and_mt = params.get("tm_and_mt") as CrowdinTmAndMtFilter
        result.pre_translation = params.get("pre_translation") as CrowdinPreTranslationFilter
        result.comments = params.get("comments") as CrowdinCommentsFilter
        result.screenshots = params.get("screenshots") as CrowdinScreenshotsFilter
        result.qa_issues = params.get("qa_issues") as CrowdinSearchScope
        result.string_type = params.get("string_type") as CrowdinStringTypeFilter
        result.votes = params.get("votes") as CrowdinVoteFilter
        result.votes_count = +params.get("votes_count")
        result.translated_by_user = params.get("translated_by_user")
        result.not_translated_by_user = params.get("not_translated_by_user")
        result.approved_by_user = params.get("approved_by_user")
        result.not_approved_by_user = params.get("not_approved_by_user")
        result.sort_method = +params.get("sort_method") as CrowdinSortMethod
        result.sort_ascending = +params.get("sort_ascending") !== 0
        return result;
    }
}

export class CrowdinCroQLSearchQueryParams extends CrowdinSearchQueryParams {
    constructor() {
        super(CrowdinSearchQueryType.CROQL_FILTERING);
    }

    croql_expression?: string
    ai_query?: string

    static generateFromSearchParams(params: URLSearchParams): CrowdinCroQLSearchQueryParams {
        const result = new CrowdinCroQLSearchQueryParams();
        result.croql_expression = params.get("croql_expression")
        result.ai_query = params.get("ai_query")
        return result;
    }
}
