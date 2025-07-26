import {ClickBehaviorOption} from "../../module/strings-in-comments/settings/click-behavior-option";
import {ExtensionMessageId} from "../../module/strings-in-comments/aux-objects/extension-message";
import {base64ToObject, listenToExtensionMessage, objectToBase64, postExtensionMessage} from "../../util/util";
import {
    DomainLanguage,
    ProjectLanguage,
    setDefaultLanguageForDomain,
    setDefaultLanguageForProject
} from "../../module/default-language/default-language-helper";

export class ExtensionSettings {

    version: number = 1;
    clickBehavior: number = 1;
    preventPreFilter: BooleanishNumber = 1;
    defaultLanguage: string = "W10="; // empty array

}

export type BooleanishNumber = 0 | 1;

function isBooleanishNumber(n: number): boolean {
    return [0, 1].includes(n);
}

let extensionSettings: ExtensionSettings | undefined = undefined;

export async function getSettings(): Promise<ExtensionSettings> {
    if (!extensionSettings) {
        if (chrome && chrome.storage && chrome.storage.sync){
            return await chrome.storage.sync.get(null)
                .then(data => data as ExtensionSettings)
                .then(async savedSettings => {
                    if (savedSettings) {
                        extensionSettings = savedSettings;
                    } else {
                        extensionSettings = new ExtensionSettings();
                        await chrome.storage.sync.set(extensionSettings);
                    }
                })
                .then(() => extensionSettings)
        } else {
            return new ExtensionSettings();
        }
    } else {
        return extensionSettings;
    }
}

void getSettings();

export async function importSettings(base64: string): Promise<boolean> {
    const instance = base64ToObject(base64, ExtensionSettings);
    if (instance instanceof ExtensionSettings) {
        extensionSettings = instance;
        await chrome.storage.sync.set(extensionSettings);
        postExtensionMessage(ExtensionMessageId.SETTINGS_IMPORTED, extensionSettings);
        return true;
    }
    return false;
}

export async function exportSettings(): Promise<string> {
    return await getSettings().then(s => objectToBase64(s))
}


listenToExtensionMessage<number>(ExtensionMessageId.SETTINGS_CLICK_BEHAVIOR_CHANGED, m => {
    const newBehavior = ClickBehaviorOption.fromId(m);
    if (newBehavior) {
        getSettings().then(s => {
            s.clickBehavior = newBehavior.id;
            void chrome.storage.sync.set(s);
        });
    }
});

listenToExtensionMessage<number>(ExtensionMessageId.SETTINGS_PREVENT_PRE_FILTERS_CHANGED, m => {
    const newOption = m as BooleanishNumber;
    if (isBooleanishNumber(newOption)) {
        getSettings().then(s => {
            s.preventPreFilter = newOption;
            void chrome.storage.sync.set(s);
        });
    }
})

listenToExtensionMessage<DomainLanguage>(ExtensionMessageId.SETTINGS_DOMAIN_DEFAULT_LANGUAGE_CHANGED, m => {
    if (m) {
        getSettings().then(s => {
            setDefaultLanguageForDomain(s, m.d, m.l, m.m);
        })
    }
})

listenToExtensionMessage<ProjectLanguage>(ExtensionMessageId.SETTINGS_PROJECT_DEFAULT_LANGUAGE_CHANGED, m => {
    if (m) {
        getSettings().then(s => {
            setDefaultLanguageForProject(s, m.d, m.p, m.l);
        })
    }
})

