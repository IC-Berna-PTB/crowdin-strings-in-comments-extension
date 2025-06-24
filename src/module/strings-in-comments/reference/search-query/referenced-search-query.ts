import {Reference} from "../reference";
import {CrowdinSearchParameters} from "../../../../util/crowdin/crowdin-search-parameters";

export class ReferencedSearchQuery implements Reference {
    private readonly projectId: number;
    private readonly query: CrowdinSearchParameters;

    constructor(projectId: number, query: CrowdinSearchParameters) {
        this.projectId = projectId;
        this.query = query;
    }

    getProjectId(): number {
        return this.projectId;
    }

    getQuery(): CrowdinSearchParameters {
        return this.query;
    }

    generateHtml(): HTMLElement | undefined {
        return undefined;
    }
}

