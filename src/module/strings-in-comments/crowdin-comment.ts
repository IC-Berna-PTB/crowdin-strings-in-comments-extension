import {Reference} from "./reference/reference";

export class CrowdinComment {
    elementId: string;
    htmlContent: string;
    references: Reference[];
    showingStrings: boolean;

    constructor(elementId: string, htmlContent: string, references: Reference[] = []) {
        this.elementId = elementId;
        this.htmlContent = htmlContent;
        this.references = references;
        this.showingStrings = false;
    }

    withReplacedReferences(references: Reference[]): CrowdinComment {
        return new CrowdinComment(this.elementId, this.htmlContent, references);
    }

    withAppendedReferences(references: Reference[]): CrowdinComment {
        const resultReferences: Reference[] = [];
        resultReferences.push(...this.references);
        resultReferences.push(...references);
        return new CrowdinComment(this.elementId, this.htmlContent, resultReferences);
    }
}
