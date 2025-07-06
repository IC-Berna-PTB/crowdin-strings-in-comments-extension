import {ClickBehaviorOption} from "../../module/strings-in-comments/settings/click-behavior-option";
import {ExtensionMessage, ExtensionMessageId} from "../../module/strings-in-comments/aux-objects/extension-message";


export class ExtensionSettings {

    loaded: number = 1;
    clickBehavior: number = 1;
    preventPreFilter: BooleanishNumber = 1;
}

export type BooleanishNumber = 0 | 1;

function isBooleanishNumber(n: number): boolean {
    return [0, 1].includes(n);
}

let extensionSettings: ExtensionSettings | undefined =  undefined;

export async function getSettings(): Promise<ExtensionSettings> {
    if (!extensionSettings) {
        return await chrome.storage.sync.get(null)
            .then(data => data as ExtensionSettings)
            .then(async savedSettings => {
                if (savedSettings.loaded) {
                    extensionSettings = savedSettings;
                } else {
                    extensionSettings = new ExtensionSettings();
                    await chrome.storage.sync.set(extensionSettings);
                }
            })
            .then(() => extensionSettings)
    } else {
        return extensionSettings;
    }
}

void getSettings();

window.addEventListener('message', (e: MessageEvent<ExtensionMessage<number>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_CLICK_BEHAVIOR_CHANGED) {
        const newBehavior = ClickBehaviorOption.fromId(e.data.message);
        if (newBehavior) {
            extensionSettings.clickBehavior = newBehavior.id;
            chrome.storage.sync.set(extensionSettings);
        }
    }
});

window.addEventListener('message', (e: MessageEvent<ExtensionMessage<number>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_PREVENT_PRE_FILTERS_CHANGED) {
        console.log(e);
        const newOption = e.data.message as BooleanishNumber;
        if (isBooleanishNumber(newOption)) {
            extensionSettings.preventPreFilter = newOption;
            chrome.storage.sync.set(extensionSettings);
        }
    }
})
