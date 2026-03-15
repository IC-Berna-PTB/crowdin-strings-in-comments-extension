import {observeElementEvenIfNotReady} from "../../util/util";

const regexp = /\{(\S[^:][^\s,]+)(,.*)?}*/g;

observeElementEvenIfNotReady(".string-key-container--text", (e) => {
    const wrapperId = "csic-icu-warning-wrapper";
    let warningWrapper = document.querySelector(`#${wrapperId}`);
    if (warningWrapper === undefined || warningWrapper === null) {
        warningWrapper = document.createElement("div");
        warningWrapper.id = wrapperId;
        const wrapper = document.querySelector(`.string-key-container--wrapper`);
        wrapper.after(warningWrapper);
    }

    // @ts-expect-error crowdin not available while programming
    if (window.crowdin.translation.is_icu || window.crowdin.translation.file_type != "vdf" || !window.crowdin.translation.key.endsWith(":f")) {
        warningWrapper.remove();
        return;
    }

    warningWrapper.replaceChildren();

    // @ts-expect-error crowdin not available while programming
    const text: string = window.crowdin.translation.text;
    let match = regexp.exec(text);
    const variables = [];
    while (match !== null) {
        variables.push(match[1]);
        match = regexp.exec(text);
    }

    warningWrapper.textContent = `This is an ICU string. Variables:`;
    warningWrapper.appendChild(document.createElement("br"));
    variables.map(s => `{${s}}`)
        .map(s => createVariableElement(s))
        .forEach(e => warningWrapper.appendChild(e));
}, true);

function createVariableElement(s: string): HTMLElement {
    const element = document.createElement("span");
    element.classList.add("crowdin_highlight", "placeholder_light");
    element.textContent = s;
    return element;
}