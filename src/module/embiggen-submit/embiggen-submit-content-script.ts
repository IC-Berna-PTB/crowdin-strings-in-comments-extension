import {listenToExtensionMessage, observeElementEvenIfNotReady} from "../../util/util";
import {requestSettings} from "../../common/extension-settings-client";
import {ExtensionMessageId} from "../../common/extension-message";


observeElementEvenIfNotReady("#suggest_translation", (element: HTMLButtonElement, disconnect) => {
    disconnect();
    listenToExtensionMessage(ExtensionMessageId.SETTINGS_RETRIEVED, () => {
        applyOption(element);
    })
    applyOption(element);
    const mutationObserver = new MutationObserver(() => {
        applyOption(element);
    });
    mutationObserver.observe(element, {attributeFilter: ["disabled"], childList: false, subtree: false});
}, true);

function applyOption(buttonElement: HTMLButtonElement) {
    buttonElement.style.backgroundColor = null;
    buttonElement.querySelectorAll(".csic-submit-text")
        .forEach(e => e.remove());
    showText().then((value) => {
        value && buttonElement.append(createElement());
    });
    getColor(!buttonElement.disabled).then(color => {
        buttonElement.style.backgroundColor = color;
    })
}

function createElement(): HTMLSpanElement {
    const element = document.createElement("span");
    element.classList.add("csic-submit-text");
    element.textContent = " SUBMIT";
    return element;
}

async function showText(): Promise<Boolean> {
    return await requestSettings()
        .then(s => !!s.embiggenSubmit);
}

async function getColor(buttonEnabled: boolean): Promise<string | undefined> {
    return await requestSettings()
        .then(s => {
            if (!s.submitColorEnabled) {
                return undefined;
            }
            if (buttonEnabled) {
                return s.submitColorValue;
            }
            return s.submitDisabledColorValue;
        });
}