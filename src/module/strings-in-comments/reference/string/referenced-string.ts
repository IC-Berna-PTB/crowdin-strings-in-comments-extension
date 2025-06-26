import {Reference} from "../reference";

export interface ReferencedString extends Reference {
    getProjectId(): number;

    getStringId(): number;

    getFallbackFileId(): number | null;

    getFallbackKey(): string | null;

}
