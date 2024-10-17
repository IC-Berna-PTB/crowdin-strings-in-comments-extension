import {ReferencedString} from "./referenced-string";

export class ReferencedStringId implements ReferencedString {
    projectId: number;
    stringId: number;

    constructor(projectId: number, stringId: number) {
        this.projectId = projectId;
        this.stringId = stringId;
    }

    getProjectId(): number {
        return this.projectId;
    }

    getStringId(): number {
        return this.stringId;
    }
}