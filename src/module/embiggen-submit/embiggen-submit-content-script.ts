import {listenToExtensionMessage, observeElementEvenIfNotReady} from "../../util/util";
import {requestSettings} from "../../common/extension-settings-client";
import {ExtensionMessageId} from "../../common/extension-message";

observeElementEvenIfNotReady("#suggest_translation", (element, disconnect) => {
    disconnect();
    listenToExtensionMessage(ExtensionMessageId.SETTINGS_RETRIEVED, () => {
        applyOption();
    })
    applyOption();
}, true);

function applyOption() {
    let buttonElement = document.querySelector("#suggest_translation");
    if (buttonElement === null) {
        return;
    }
    let textElement = buttonElement.querySelector(".csic-submit-text");
    if (textElement !== null) {
        textElement.remove();
    }
    showText().then((value) => {
        value && buttonElement.append(createElement());
    });
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