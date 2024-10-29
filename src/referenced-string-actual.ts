import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";
import {CrowdinUserProjects} from "./crowdin-api/user-projects-response/crowdin-user-projects";
import {TranslationStatus} from "./util";
import {crowdinTranslationStatusIcon} from "./crowdin-html-elements";

function truncateIfLong(text: string, maxLength: number) {
    return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

function detailIfLong(element: HTMLElement, maxLength: number) {
    if (element.innerText.length > maxLength) {
        const text = element.innerText;
        element.innerText = "";
        const summary = document.createElement("summary");
        summary.innerText = text.substring(0, maxLength);
        const details = document.createElement("details");
        details.innerText = text;
        details.appendChild(summary);
        element.appendChild(details);
    }
}

export class ReferencedStringActual implements ReferencedString {
    source: string;
    translation?: string;
    translationStatus: TranslationStatus;
    key?: string;
    id: ReferencedStringId;

    constructor(projectId: number, stringId: number, source: string, translation?: string, translationStatus?: TranslationStatus, key?: string) {
        this.source = source;
        this.translation = translation;
        this.translationStatus = translationStatus;
        this.id = new ReferencedStringId(projectId, stringId);
        this.key = key;
    }

    private readonly MAX_TEXT_LENGTH = 100;

    generateHtml(): HTMLElement | undefined {
        if (this.translation === undefined) {
            return undefined;
        }
        const languages = window.location.pathname.split("/")[4];

        const translationStatusWrapper = document.createElement("div");
        translationStatusWrapper.classList.add("csic-translation-status-wrapper");

        const translationStatus = crowdinTranslationStatusIcon(this.translationStatus);
        translationStatusWrapper.appendChild(translationStatus);

        const translationText = document.createElement("span");
        if (this.translationStatus === "not-translated") {
            translationText.classList.add("suggestion_tm_source");
            translationText.innerText = "<no suggestion available>"
        } else {
            translationText.classList.add("term_item");
            translationText.addEventListener("click", () => navigator.clipboard.writeText(this.translation))
            translationText.innerText = truncateIfLong(this.translation, this.MAX_TEXT_LENGTH);
            translationText.title = (translationText.innerText.length > this.MAX_TEXT_LENGTH ? this.translation + "\n\n" : "") + "Click to copy to clipboard";
        }

        const translationTextWrapper = document.createElement("div");
        translationTextWrapper.classList.add("csic-translation-text-wrapper");
        translationTextWrapper.appendChild(translationText);

        const sourceTextWrapper = document.createElement("div");
        sourceTextWrapper.classList.add("csic-source-text-wrapper");
        const sourceText = document.createElement("a");
        sourceText.href = `${window.location.origin}/editor/${this.getProjectId()}/all/${languages}/#${this.getStringId()}`;
        sourceText.classList.add("suggestion_tm_source", "csic-source-text");
        sourceText.innerText = truncateIfLong(this.source, this.MAX_TEXT_LENGTH);
        if (this.key !== undefined) {
            CrowdinUserProjects.getFromId(this.getProjectId())
                .then(name => sourceText.title = (sourceText.innerText.length > this.MAX_TEXT_LENGTH ? this.source + "\n\n" : "") + `Key: ${this.key}\nProject: ${name}`)
        }
        sourceText.target = "_blank";
        sourceTextWrapper.appendChild(sourceText);

        const container = document.createElement("div");
        container.appendChild(translationStatusWrapper);
        container.appendChild(translationTextWrapper);
        container.appendChild(sourceTextWrapper);
        return container;
    }

    getProjectId(): number {
        return this.id.getProjectId();
    }

    getStringId(): number {
        return this.id.getStringId();
    }
}
