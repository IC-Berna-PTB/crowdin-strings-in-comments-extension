import {Reference} from "../reference";
import {
    CrowdinSearchParametersBasic,
    CrowdinSearchQueryType
} from "../../../../../util/crowdin/crowdin-search-parameters";

export abstract class ReferencedString implements Reference {

    abstract getProjectId(): number;

    abstract getStringId(): number;

    abstract getFallbackFileId(): number | null;

    abstract getFallbackKey(): string | null;

    /**
     * Converts this ReferencedString into a CrowdinSearchParametersBasic instance.
     *
     * If {@link getFallbackKey()} returns `null`, this method also returns `null`.
     * @param languageId
     */
    toCrowdinSearchParametersBasic(languageId: number): CrowdinSearchParametersBasic | null {
        if (this.getFallbackKey() === null) {
            return null;
        }
        const parameters = new CrowdinSearchParametersBasic(CrowdinSearchQueryType.SHOW_ALL,
            this.getProjectId(),
            this.getFallbackFileId(),
            languageId,
            1,
            this.getFallbackKey());
        parameters.search_scope = "key";
        parameters.search_strict = true;
        return parameters;
    }

}
