import {Reference} from "./reference/reference";

export class CommentWithReferences {
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

    withReplacedReferences(references: Reference[]): CommentWithReferences {
        return new CommentWithReferences(this.elementId, this.htmlContent, references);
    }

    withAppendedReferences(references: Reference[]): CommentWithReferences {
        const resultReferences: Reference[] = [];
        resultReferences.push(...this.references);
        resultReferences.push(...references);
        return new CommentWithReferences(this.elementId, this.htmlContent, resultReferences);
    }
}
