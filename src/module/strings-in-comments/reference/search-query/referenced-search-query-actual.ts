import {ReferencedSearchQuery} from "./referenced-search-query";
import {ReferencedStringActual} from "../string/referenced-string-actual";
import {CrowdinSearchParameters} from "../../../../util/crowdin/crowdin-search-parameters";

export class ReferencedSearchQueryActual extends ReferencedSearchQuery {
    results: ReferencedStringActual[];


    constructor(projectId: number, query: CrowdinSearchParameters, results: ReferencedStringActual[]) {
        super(projectId, query);
        this.results = results;
    }

    generateHtml(): HTMLElement | undefined {
        const div = document.createElement("div");
        this.results.map(x => x.generateHtml())
            .forEach(x => div.append(x))
        return div;
    }
}
