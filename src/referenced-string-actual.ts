import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";

export class ReferencedStringActual implements ReferencedString {
    source: string;
    translation?: string;
    id: ReferencedStringId;

    constructor(projectId: number, stringId: number, source: string, translation?: string) {
        this.source = source;
        this.translation = translation;
        this.id = new ReferencedStringId(projectId, stringId);
    }

    static from(other: ReferencedString, source: string, translation?: string): ReferencedStringActual {
        return new ReferencedStringActual(other.getProjectId(), other.getStringId(), source, translation);
    }

    getProjectId(): number {
        return this.id.getProjectId();
    }

    getStringId(): number {
        return this.id.getStringId();
    }
}