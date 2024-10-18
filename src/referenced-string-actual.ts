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

    generateHtml(): HTMLElement | undefined {
        if (this.translation === undefined) {
            return undefined;
        }
        const translationDiv = document.createElement("div");
        const translationSpan = document.createElement("span");
        translationSpan.classList.add("term_item");
        translationSpan.addEventListener("click", () => navigator.clipboard.writeText(this.translation))
        translationSpan.innerText = this.translation;
        translationDiv.appendChild(translationSpan)
        translationSpan.title = "Click to copy to clipboard"

        const sourceDiv = document.createElement("div");
        const sourceSpan = document.createElement("span");
        sourceSpan.classList.add("suggestion_tm_source");
        sourceSpan.style.fontStyle += "italic";
        sourceSpan.innerText = this.source;
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