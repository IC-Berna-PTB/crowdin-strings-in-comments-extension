import {ClickBehaviorOption} from "../../module/strings-in-comments/settings/click-behavior-option";
import {ExtensionMessageId} from "../../module/strings-in-comments/aux-objects/extension-message";
import {listenToExtensionMessage} from "../../util/util";


export class ExtensionSettings {

    loaded: number = 1;
    clickBehavior: number = 1;
    preventPreFilter: BooleanishNumber = 1;
    defaultLanguage: string = "[]";

}

const INVALID_LANGUAGE = -1;

async function getDefaultLanguageForProject(domain: string | null, projectId: number): Promise<number> {
    const s = await getSettings();
    const array = getDomainEntryArray(s);
    let domainEntry = array.find(e => e.d === domain);
    // No domain entry, no default language set
    if (!domainEntry) {
        return undefined;
    }
    // If there's a default language for the domain, and it's the forced default for everything, then that's it
    if (domainEntry.l !== INVALID_LANGUAGE && domainEntry.m === DomainEntryMode.OVERRIDE) {
        return domainEntry.l;
    }
    // If the domain language isn't forced-override and the project has a default, return it
    let projectEntry = domainEntry.p.find(e_1 => e_1.p === projectId);
    if (projectEntry) {
        return projectEntry.l;
    }
    // Otherwise, if the domain has a fallback language for projects without a default, that's it
    if (!projectEntry && domainEntry.l !== INVALID_LANGUAGE && domainEntry.m === DomainEntryMode.FALLBACK) {
        return domainEntry.l;
    }
    return INVALID_LANGUAGE;
}


function getDomainEntryArray(settings: ExtensionSettings): DomainLanguage[] {
    return JSON.parse(atob(settings.defaultLanguage)) as DomainLanguage[];
}

function serializeDomainEntryArray(domainEntries: DomainLanguage[]): string {
    return btoa(JSON.stringify(domainEntries));
}

function saveNewLanguageSettings(settings: ExtensionSettings, array: DomainLanguage[]): void {
    settings.defaultLanguage = serializeDomainEntryArray(array);
    void chrome.storage.sync.set(settings);
}

function setDefaultLanguageForDomain(settings: ExtensionSettings, domain: string | null, languageId: number, mode: DomainEntryMode): void {
    const array = getDomainEntryArray(settings);
    let domainEntry = array.find(e => e.d === domain);
    if (!domainEntry) {
        domainEntry = new DomainLanguage(domain);
        array.push(domainEntry);
    }
    domainEntry.l = languageId;
    domainEntry.m = mode;
    saveNewLanguageSettings(settings, array);
}

function setDefaultLanguageForProject(settings: ExtensionSettings, domain: string | null, projectId: number, languageId: number) {
    const array = getDomainEntryArray(settings);
    let domainEntry = array.find(e => e.d === domain);
    if (!domainEntry) {
        domainEntry = new DomainLanguage(domain);
        array.push(domainEntry);
    }
    const filteredProjects = domainEntry.p.filter(p => p.p === projectId);
    if (languageId !== INVALID_LANGUAGE) {
        filteredProjects.push(new ProjectLanguage(projectId, languageId));
    }
    domainEntry.p = filteredProjects;
    saveNewLanguageSettings(settings, array);
}


export class DomainLanguage {
    // domain
    d: string | null;
    // language ID
    l: number | null = null;
    // mode
    m: DomainEntryMode = DomainEntryMode.DISABLED;
    // Projects
    p: ProjectLanguage[] = [];

    constructor(domain: string | null) {
        this.d = domain;
    }

}

enum DomainEntryMode {
    DISABLED = 0,
    FALLBACK = 1,
    OVERRIDE = 2,
}

export class ProjectLanguage {
    // domain ID
    d: string | null;
    // project ID
    p: number | null;
    // language ID
    l: number;


    constructor(projectId: number | null, languageId: number) {
        this.p = projectId;
        this.l = languageId;
    }
}

export type BooleanishNumber = 0 | 1;

function isBooleanishNumber(n: number): boolean {
    return [0, 1].includes(n);
}

let extensionSettings: ExtensionSettings | undefined = undefined;

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

