import {base64ToObject, listenToExtensionMessage, postExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {BooleanishNumber, ExtensionSettings} from "../../common/extension-settings";
import {plainToInstance} from "class-transformer";
import {ClickBehaviorOption} from "../strings-in-comments/settings/click-behavior-option";
import {
    DomainLanguage,
    ProjectLanguage,
    setDefaultLanguageForDomain, setDefaultLanguageForProject
} from "../default-language/default-language-helper";

listenToExtensionMessage<unknown>(ExtensionMessageId.SETTINGS_REQUESTED_BY_MODULE, () => {
    getSettings().then(settings => postExtensionMessage(ExtensionMessageId.SETTINGS_RETRIEVED, settings))
})

let extensionSettings: ExtensionSettings | undefined = undefined;

function isBooleanishNumber(n: number): boolean {
    return [0, 1].includes(n);
}

async function getSettings(): Promise<ExtensionSettings> {
    if (!extensionSettings) {
        if (typeof chrome !== 'undefined' && chrome && chrome.storage && chrome.storage.sync) {
            return await chrome.storage.sync.get(null)
                .then(data => data as ExtensionSettings)
                .then(async savedSettings => {
                    if (savedSettings) {
                        extensionSettings = plainToInstance<ExtensionSettings, unknown>(ExtensionSettings, savedSettings);
                        await chrome.storage.sync.set(extensionSettings);
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

listenToExtensionMessage<number>(ExtensionMessageId.SETTINGS_CLICK_BEHAVIOR_CHANGED, m => {
    const newBehavior = ClickBehaviorOption.fromId(m);
    if (newBehavior) {
        getSettings().then(s => {
            s.clickBehavior = newBehavior.id;
            void chrome.storage.sync.set(s);
        });
    }
});

listenToBooleanSettingChange(ExtensionMessageId.SETTINGS_PREVENT_PRE_FILTERS_CHANGED, (no, s) => {
    s.preventPreFilter = no;
    return s;
})

listenToBooleanSettingChange(ExtensionMessageId.SETTINGS_DARK_THEME_HTML_PREVIEW_CHANGED, (no, s) => {
    s.darkThemeHtml = no;
    return s;
})

listenToBooleanSettingChange(ExtensionMessageId.SETTINGS_ALL_CONTENT_REDIRECT_CHANGED, (no, s) => {
    s.allContentRedirect = no;
    return s;
})

function listenToBooleanSettingChange(messageId: ExtensionMessageId, apply: (newOption: BooleanishNumber, settings: ExtensionSettings) => ExtensionSettings) {
    listenToExtensionMessage<number>(messageId, m => {
        const newOption = m as BooleanishNumber;
        if (!isBooleanishNumber(newOption)) {
            return;
        }
        getSettings()
            .then(s => apply(newOption, s))
            .then(s => chrome.storage.sync.set(s))
    })
}

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

listenToExtensionMessage<string>(
    ExtensionMessageId.SETTINGS_IMPORT_REQUESTED,
    s => importSettings(s).then(async result => {
        if (result) {
            postExtensionMessage(ExtensionMessageId.SETTINGS_IMPORT_SUCCESSFUL, await getSettings())
        } else {
            postExtensionMessage<string>(ExtensionMessageId.SETTINGS_IMPORT_FAILED, "Could not import settings!")
        }
    }))

async function importSettings(base64: string): Promise<boolean> {
    const instance = base64ToObject(base64, ExtensionSettings);
    if (instance instanceof ExtensionSettings) {
        extensionSettings = instance;
        await chrome.storage.sync.set(extensionSettings);
        postExtensionMessage(ExtensionMessageId.SETTINGS_IMPORT_SUCCESSFUL, extensionSettings);
        return true;
    }
    return false;
}
