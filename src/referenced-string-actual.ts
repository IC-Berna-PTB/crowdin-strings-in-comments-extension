import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";
import {CrowdinUserProjects} from "./crowdin-api/user-projects-response/crowdin-user-projects";

function truncateIfLong(text: string, maxLength: number) {
    return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

export class ReferencedStringActual implements ReferencedString {
    source: string;
    translation?: string;
    key?: string;
    id: ReferencedStringId;

    constructor(projectId: number, stringId: number, source: string, translation?: string, key?: string) {
        this.source = source;
        this.translation = translation;
        this.id = new ReferencedStringId(projectId, stringId);
        this.key = key;
    }

    static from(other: ReferencedString, source: string, translation?: string, key?: string): ReferencedStringActual {
        return new ReferencedStringActual(other.getProjectId(), other.getStringId(), source, translation, key);
    }

    generateHtml(): HTMLElement | undefined {
        if (this.translation === undefined) {
            return undefined;
        }
        const languages = window.location.pathname.split("/")[4];

        const translationDiv = document.createElement("div");
        const translationSpan = document.createElement("span");
        translationSpan.classList.add("term_item");
        translationSpan.addEventListener("click", () => navigator.clipboard.writeText(this.translation))
        translationSpan.innerText = truncateIfLong(this.translation, 100);
        translationDiv.appendChild(translationSpan)
        translationSpan.title = (translationSpan.innerText.length > 100 ? this.translation + "\n" : "") + "Click to copy to clipboard";

        const sourceDiv = document.createElement("div");
        const sourceSpan = document.createElement("a");
        sourceSpan.href = `${window.location.origin}/editor/${this.getProjectId()}/all/${languages}/#${this.getStringId()}`;
        sourceSpan.classList.add("suggestion_tm_source");
        sourceSpan.style.fontStyle += "italic";
        sourceSpan.style.fontStyle += "underline";
        sourceSpan.innerText = truncateIfLong(this.source, 100);
        if (this.key !== undefined) {
            CrowdinUserProjects.getFromId(this.getProjectId())
                .then(name => sourceSpan.title = (sourceSpan.innerText.length > 100 ? this.source + "\n" : "") + `Key: ${this.key}\nProject: ${name}`)
        }
        sourceSpan.target = "_blank";
        sourceDiv.appendChild(sourceSpan);

        const container = document.createElement("div");
        container.appendChild(translationDiv);
        container.appendChild(sourceDiv);
        return container;
    }

    getProjectId(): number {
        return this.id.getProjectId();
    }

    getStringId(): number {
        return this.id.getStringId();
    }
}
