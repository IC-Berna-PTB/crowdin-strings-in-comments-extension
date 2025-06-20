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

export abstract class CrowdinSearchQueryParams {
    filter: "basic" | "advanced" | "croql"
    value: CrowdinSearchQueryType


    constructor(filter: "basic" | "advanced" | "croql", value: CrowdinSearchQueryType) {
        this.filter = filter
        this.value = value

    }
}

export class CrowdinBasicSearchQueryParams extends CrowdinSearchQueryParams {


    constructor(value: CrowdinSearchQueryType) {
        super("basic", value)
    }

    searchScope?: CrowdinSearchScope
    searchStrict = "false" //  Called "Exact match" in the web UI
    searchFullMatch = false // Called "Match whole phrase" in the web UI
    caseSensitive = false // Called "Match case" in the web UI

}

export class CrowdinAdvancedSearchQueryParams extends CrowdinSearchQueryParams {

    constructor() {
        super("advanced", CrowdinSearchQueryType.ADVANCED_FILTERING);
    }

    addedFrom?: Date
    addedTo?: Date
    updatedFrom?: Date
    updatedTo?: Date
    changedFrom?: Date

    verbal_expression_scope?: CrowdinSearchScope
    verbal_expression?: string

    translations?: "updated" | "partially_translated" | "translated" | "duplicate_source_string" | "modified_source_strings"
    approvals?: "translated_not_approved" | "partially_approved" | "approved" | "have_translations_after_approval"
    approvals_count_select?: "approvals_greater_than" | "approvals_less_than"
    approvals_count?: number
    tm_and_mt?: "by_mt" | "by_tm" | "by_ai" | "by_mt_or_tm" // The last one includes AI
    pre_translation?: "used" | "not_used"
    comments?: "do_not_have_comments" | "have_comments" | "have_unresolved_issues" | "has_unresolved_issues_general" |
        "has_unresolved_issues_poor_translation" | "has_unresolved_issues_lack_context" | "has_unresolved_issues_wrong_source"
    screenshots?: "without_screenshots" | "with_screenshots"
    qa_issues?: CrowdinSearchScope
    string_type?: "string_type_simple" | "string_type_plurals" | "string_type_icu"
    votes?: "votes_greater_than" | "votes_less_than"
    votes_count?: number
    translated_by_user?: string
    not_translated_by_user?: string
    approved_by_user?: string
    not_approved_by_user?: string
    sort_method?: CrowdinSortMethod
    sort_ascending?: boolean
}

export class CrowdinCroQLSearchQueryParams extends CrowdinSearchQueryParams {
    constructor() {
        super("croql", CrowdinSearchQueryType.CROQL_FILTERING);
    }

    croql_expression?: string
    ai_query?: string

}
