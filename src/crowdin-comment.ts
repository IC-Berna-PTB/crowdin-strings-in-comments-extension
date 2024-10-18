import {ReferencedString} from "./referenced-string";

export class CrowdinComment {
    elementId: string;
    text: string;
    references: ReferencedString[];
    showingStrings: boolean;

    constructor(elementId: string, text: string, references: ReferencedString[] = []) {
        this.elementId = elementId;
        this.text = text;
        this.references = references;
        this.showingStrings = false;
    }

    withReferences(references: ReferencedString[]): CrowdinComment {
        return new CrowdinComment(this.elementId, this.text, references);
    }
}