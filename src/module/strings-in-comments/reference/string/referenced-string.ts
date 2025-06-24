import {Reference} from "../reference";

export interface ReferencedString extends Reference {
    getProjectId(): number;

    getStringId(): number;

}
