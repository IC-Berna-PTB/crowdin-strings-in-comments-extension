import {ReferencedSearchQuery} from "./referenced-search-query";
import {ReferencedStringActual} from "../string/referenced-string-actual";
import {CrowdinSearchParameters, CrowdinSearchQueryType} from "../../../../util/crowdin/crowdin-search-parameters";
import {convertUrlToCurrentLanguage} from "../../../../util/util";

export class ReferencedSearchQueryActual extends ReferencedSearchQuery {
    results: ReferencedStringActual[];
    totalResults: number;


    constructor(projectId: number,
                query: CrowdinSearchParameters,
                originalUrl: URL,
                results: ReferencedStringActual[],
                totalResults: number) {
        super(projectId, query, originalUrl);
        this.results = results;
        this.totalResults = totalResults;
    }

    private readonly MAX_RESULTS = 50;

    generateHtml(): HTMLElement | undefined {
        const div = document.createElement("div");
        div.classList.add("csic-search-query--container")
        const upperLabel = this.createUpperLabelElement();
        div.append(upperLabel);
        if (this.totalResults === 1 && this.results.length === 1) {
            div.append(this.results[0].generateHtml());
        } else {
            const resultsContainer = document.createElement("div");
            resultsContainer.classList.add("csic-search-query--results-container");
            for (let i = 0; i < Math.min(this.results.length); i++) {
                resultsContainer.append(this.results[i].generateHtml())
                const separator = document.createElement("hr");
                separator.classList.add("csic-separator");
                resultsContainer.append(separator);
            }
            div.append(resultsContainer);
        }
        return div;
    }

    private createUpperLabelElement() {
        const upperLabel = document.createElement("div");
        upperLabel.classList.add("csic-search-query--upper-label");
        const searchForPrefixElement = this.createSearchForPrefixElement();
        upperLabel.append(searchForPrefixElement);
        upperLabel.append(this.createSearchTargetElement());
        const resultInfoElement = this.createResultInfoElement();
        upperLabel.append(document.createElement("br"));
        upperLabel.append(resultInfoElement);
        return upperLabel;
    }

    private createResultInfoElement() {
        let text;
        if (this.totalResults === 1) {
            text = `(Only one result!)`
        } else if (this.totalResults > this.MAX_RESULTS) {
            text = `(Showing first 50 of ${this.totalResults} results, click here to view all)`
        } else {
            text = `(Showing all ${this.totalResults} results, click here to open in another tab)`
        }
        const span = document.createElement("span");
        span.classList.add("csic-secondary");
        const anchor = document.createElement("a");
        anchor.href = convertUrlToCurrentLanguage(this.getOriginalUrl())
        anchor.textContent = text;
        span.append(anchor);
        return span;
    }

    private createSearchForPrefixElement() {
        const firstLineSpan = document.createElement("span");
        firstLineSpan.classList.add("csic-muted");
        firstLineSpan.textContent = "Search for ";
        return firstLineSpan;
    }

    private createSearchTargetElement() {
        if (this.getSearchParameters().query && this.getSearchParameters().query.trim() !== "") {
            return this.getSearchParameters().query.trim();
        }
        const span = document.createElement("span");
        span.classList.add("csic-muted");
        if (this.getSearchParameters().filter === CrowdinSearchQueryType.CROQL_FILTERING) {
            span.textContent = "CroQL query";
        }
        if (this.getSearchParameters().filter === CrowdinSearchQueryType.ADVANCED_FILTERING) {
            span.textContent = "advanced filters";
        }
        return span;
    }
}
