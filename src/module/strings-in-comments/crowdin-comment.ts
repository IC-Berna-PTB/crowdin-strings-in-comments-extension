import {Reference} from "./reference/reference";

export class CrowdinComment {
    elementId: string;
    text: string;
    references: Reference[];
    showingStrings: boolean;

    constructor(elementId: string, text: string, references: Reference[] = []) {
        this.elementId = elementId;
        this.text = text;
        this.references = references;
        this.showingStrings = false;
    }

    withReplacedReferences(references: Reference[]): CrowdinComment {
        return new CrowdinComment(this.elementId, this.text, references);
    }

    withAppendedReferences(references: Reference[]): CrowdinComment {
        const resultReferences: Reference[] = [];
        resultReferences.push(...this.references);
        resultReferences.push(...references);
        return new CrowdinComment(this.elementId, this.text, resultReferences);
    }
}
