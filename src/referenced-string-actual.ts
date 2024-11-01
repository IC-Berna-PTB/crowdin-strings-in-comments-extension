import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";
import {TranslationStatus} from "./util";
import {crowdinTranslationStatusIcon} from "./crowdin-html-elements";
import {CrowdinUserProjects} from "./crowdin-api/user-projects-response/crowdin-user-projects";


function applyCollapseIfLong(element: HTMLElement, lengthToCollapse: number): HTMLElement {
    let fullText = element.innerHTML;
    if (fullText.length <= lengthToCollapse) {
        return element;
    }
    let truncatedText = element.innerHTML.substring(0, lengthToCollapse) + "…";
    let wrappingElement = document.createElement("div");
    wrappingElement.classList.add("csic-collapsible");
    const arrowElement = document.createElement("a");
    arrowElement.classList.add("csic-arrow");
    arrowElement.addEventListener("click", () => {
        wrappingElement.classList.toggle("csic-expanded");
        if (wrappingElement.classList.contains("csic-expanded")) {
            element.innerHTML = fullText;
        } else {
            element.innerHTML = truncatedText;
        }
    })
    element.innerHTML = truncatedText;
    wrappingElement.replaceChildren(arrowElement, element);
    return wrappingElement;
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
        const metadata = document.createElement("a");
        metadata.href = `${window.location.origin}/editor/${this.getProjectId()}/all/${languages}/#${this.getStringId()}`;
        metadata.target = "_blank";
        const key = document.createElement("span");
        key.classList.add("csic-metadata-key-icon");
        key.innerText = "🔑 ";

        const metadataWrapper = document.createElement("span");
        metadataWrapper.classList.add("csic-metadata");
        metadataWrapper.appendChild(key);
        metadataWrapper.appendChild(metadata);
        translationStatusWrapper.appendChild(metadataWrapper);
        if (this.key !== undefined) {
            metadata.innerText = `${this.key}`;
            CrowdinUserProjects.getFromId(this.getProjectId())
                .then(name => {metadata.title = `Project: ${name}`})
        } else {
            metadata.innerText = "&lt;loading key...&gt;";
        }

        let translationText = document.createElement("span");
        if (this.translationStatus === "not-translated") {
            translationText.classList.add("suggestion_tm_source");
            translationText.innerText = "<no suggestion available>"
        } else {
            translationText.classList.add("term_item");
            translationText.addEventListener("click", () => navigator.clipboard.writeText(this.translation))
            translationText.innerText = this.translation;
            translationText.title = "Click to copy to clipboard";
            translationText = applyCollapseIfLong(translationText, this.MAX_TEXT_LENGTH);
        }

        const translationTextWrapper = document.createElement("div");
        translationTextWrapper.classList.add("csic-translation-text-wrapper");
        translationTextWrapper.appendChild(translationText);

        const sourceTextWrapper = document.createElement("div");
        sourceTextWrapper.classList.add("csic-source-text-wrapper");
        let sourceText = document.createElement("span");
        sourceText.classList.add("suggestion_tm_source", "csic-source-text");
        sourceText.innerText = this.source;
        sourceTextWrapper.appendChild(applyCollapseIfLong(sourceText, this.MAX_TEXT_LENGTH));

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
