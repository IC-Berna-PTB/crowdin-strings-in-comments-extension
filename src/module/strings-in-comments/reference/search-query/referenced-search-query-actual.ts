import {ReferencedSearchQuery} from "./referenced-search-query";
import {ReferencedStringActual} from "../string/referenced-string-actual";
import {CrowdinSearchParameters} from "../../../../util/crowdin/crowdin-search-parameters";

export class ReferencedSearchQueryActual extends ReferencedSearchQuery {
    results: ReferencedStringActual[];
    totalResults: number;


    constructor(projectId: number, query: CrowdinSearchParameters, results: ReferencedStringActual[],totalResults: number) {
        super(projectId, query);
        this.results = results;
        this.totalResults = totalResults;
    }

    generateHtml(): HTMLElement | undefined {
        const div = document.createElement("div");
        div.classList.add("csic-search-query--container")
        const upperLabel = document.createElement("div");
        upperLabel.classList.add("csic-search-query--upper-label");
        const textFirstLine = `Search for ${this.getQuery().query}`;
        var textSecondLine;
        if (this.totalResults > 50) {
            textSecondLine = `(Showing 50 of ${this.totalResults})`
        }
        else {
            textSecondLine = `(Showing all ${this.totalResults})`
        }
        upperLabel.textContent = [textFirstLine, textSecondLine].join("\n");
        div.append(upperLabel);
        const innerDiv = document.createElement("div");
        innerDiv.classList.add("csic-search-query--inner-container");
        for (let i = 0; i < Math.min(this.results.length); i++) {
            innerDiv.append(this.results[i].generateHtml())
            const separator = document.createElement("hr");
            separator.classList.add("csic-separator");
            innerDiv.append(separator);
        }
        div.append(innerDiv);
        return div;
    }
}
