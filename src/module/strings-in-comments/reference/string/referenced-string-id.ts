import {ReferencedString} from "./referenced-string";

export class ReferencedStringId implements ReferencedString {
    projectId: number;
    stringId: number;

    constructor(projectId: number, stringId: number) {
        this.projectId = projectId;
        this.stringId = stringId;
    }

    generateHtml(): HTMLElement | undefined {
        return undefined;
    }
    getProjectId(): number {
        return this.projectId;
    }

    getStringId(): number {
        return this.stringId;
    }

    static fromUrl(url: URL): ReferencedStringId {
        const projectId = parseInt(url.pathname.split("/")[2]);
        const stringId = parseInt(url.hash.replace("#", ""));
        return new ReferencedStringId(projectId, stringId);
    }
}
