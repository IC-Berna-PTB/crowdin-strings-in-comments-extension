import {TranslationStatus} from "./util";

export function crowdinTranslationStatusIcon(status: TranslationStatus): HTMLElement {
    const element = document.createElement("div");
    element.classList.add("string-status-icon", `${status}-status`);
    return element;
}