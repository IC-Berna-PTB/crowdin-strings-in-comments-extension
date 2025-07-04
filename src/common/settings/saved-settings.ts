import {ClickBehaviorOption} from "../../module/strings-in-comments/settings/click-behavior-option";
import {ExtensionMessage, ExtensionMessageId} from "../../module/strings-in-comments/aux-objects/extension-message";

export class SavedSettings {
    clickBehavior: number = 1;
}

export let clickBehavior: ClickBehaviorOption = ClickBehaviorOption.COPY_TO_CLIPBOARD;

function loadSavedClickBehavior(): void {
    chrome.storage.sync.get(null)
        .then(data => data as SavedSettings)
        .then(settings => ClickBehaviorOption.fromId(settings.clickBehavior))
        .then(savedBehavior => {
            if (savedBehavior) {
                clickBehavior = savedBehavior
            }
        })
}

loadSavedClickBehavior();

window.addEventListener('message', (e: MessageEvent<ExtensionMessage<number>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_CLICK_BEHAVIOR_CHANGED) {
        const newBehavior = ClickBehaviorOption.fromId(e.data.message);
        if (newBehavior) {
            clickBehavior = newBehavior;
        }
    }
});
