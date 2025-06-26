import {Reference} from "../reference";
import {CrowdinSearchParameters} from "../../../../util/crowdin/crowdin-search-parameters";

export class ReferencedSearchQuery implements Reference {
    private readonly projectId: number;
    private readonly query: CrowdinSearchParameters;
    private readonly originalUrl: URL;

    constructor(projectId: number, query: CrowdinSearchParameters, originalUrl: URL) {
        this.projectId = projectId;
        this.query = query;
        this.originalUrl = originalUrl;
    }

    getProjectId(): number {
        return this.projectId;
    }

    getSearchParameters(): CrowdinSearchParameters {
        return this.query;
    }

    getOriginalUrl(): URL {
        return this.originalUrl;
    }

    generateHtml(): HTMLElement | undefined {
        return undefined;
    }
}

