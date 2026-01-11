import {postExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";

const runHotkeyActionInterval = setInterval(() => {
    // @ts-ignore
    if (!window.crowdin || !window.crowdin.hotkeys || !window.crowdin.hotkeys.runHotkeyAction) {
        return;
    }
    clearInterval(runHotkeyActionInterval);
    // @ts-ignore
    const originalFunction = window.crowdin.hotkeys.runHotkeyAction;

    //@ts-ignore
    window.crowdin.hotkeys.runHotkeyAction = (shortcutId: string, b: unknown, c: unknown) => {
        const source2HelperContainer = document.getElementById(`source2helper-container`);
        const activeElement = document.activeElement;
        const translationElement = document.getElementById(`translation`);
        const errorElement = document.getElementById(`source2helperError`);
        if (source2HelperContainer
            && errorElement
            && errorElement.innerText.trim() !== ''
            && typeof(shortcutId) === 'string'
            && shortcutId.toLowerCase() === "save_suggestion_key"
        ) {
            postExtensionMessage(ExtensionMessageId.NOTIFICATION_ERROR, "Cannot send suggestion with Source 2 errors!" +
                "Use \"Save\" button if you are sure of what you're doing.")
        }
        else if (source2HelperContainer
            && activeElement instanceof HTMLTextAreaElement
            && source2HelperContainer.contains(activeElement)
            && translationElement) {
            translationElement.focus();
            // @ts-ignore
            originalFunction.apply(window.crowdin.hotkeys, [shortcutId, b, c]);
            translationElement.dispatchEvent(new Event('input'));
            activeElement.focus();
        } else {
            // @ts-ignore
            originalFunction.apply(window.crowdin.hotkeys, [shortcutId, b, c]);
            translationElement.dispatchEvent(new Event('input'));
        }
    }
})

const runSetValueActionInterval = setInterval(() => {
    // @ts-ignore
    if (!window.crowdin || !window.crowdin.translation || !window.crowdin.translation.setValue) {
        return;
    }
    clearInterval(runSetValueActionInterval);
    // @ts-ignore
    const originalSet = window.crowdin.translation.setValue;
    // @ts-ignore
    const originalInsert = window.crowdin.translation.insertValue;
    // @ts-ignore
    window.crowdin.translation.setValue = (value) => {
        // @ts-ignore
        originalSet.apply(window.crowdin.translation, [value])
        document.querySelector("#translation").dispatchEvent(new Event('input'));
    }
    // @ts-ignore
    window.crowdin.translation.insertValue = (value) => {
        // @ts-ignore
        originalInsert.apply(window.crowdin.translation, [value])
        document.querySelector("#translation").dispatchEvent(new Event('input'));
    }
})