import {ReferencedString} from "./referenced-string";

export class ReferencedStringId extends ReferencedString {
    private readonly projectId: number;
    private readonly stringId: number;
    private readonly fallbackKey?: string
    private readonly fallbackFileId?: number;

    constructor(projectId: number, stringId: number, fallbackFileId?: number, fallbackKey?: string) {
        super();
        this.projectId = projectId;
        this.stringId = stringId;
        this.fallbackFileId = fallbackFileId;
        this.fallbackKey = fallbackKey;
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

    getFallbackFileId(): number | null {
        return this.fallbackFileId;
    }

    getFallbackKey(): string | null {
        return this.fallbackKey;
    }

    static fromUrl(url: URL): ReferencedStringId {
        let pathSplit = url.pathname.split("/");
        const projectId = parseInt(pathSplit[2]);
        const stringId = parseInt(url.hash.replace("#", ""));
        const fallbackFileId = parseInt(pathSplit[3]);
        const fallbackKey = url.searchParams.get("csic-key");
        return new ReferencedStringId(projectId, stringId, fallbackFileId, fallbackKey);
    }

}
