import {ReferencedString} from "./referenced-string";

export class CrowdinComment {
    elementId: string;
    text: string;
    references: ReferencedString[];

    constructor(elementId: string, text: string, references: ReferencedString[] = []) {
        this.elementId = elementId;
        this.text = text;
        this.references = references;
    }

    withReferences(references: ReferencedString[]): CrowdinComment {
        return new CrowdinComment(this.elementId, this.text, references);
    }
}