import {ExtensionSettings} from "../../common/extension-settings";
import {CommonContentScriptHelper} from "../common/common-content-script-helper";
import {requestSettings} from "../../common/extension-settings-client";

export const INVALID_LANGUAGE = -1;

export async function getDefaultLanguageForCurrentDomain(): Promise<number> {
    return CommonContentScriptHelper.getCurrentInit()
        .then(i => getDefaultLanguageForDomain(i.data.auth.domain))
}

export function getDefaultLanguageForDomainInSettings(settings: ExtensionSettings, domain: string): number {
    const array = getDomainEntryArray(settings);
    let domainEntry = array.find(e => e.d === domain);
    if (!domainEntry) {
        return INVALID_LANGUAGE;
    }
    return domainEntry.l;
}

export async function getDefaultLanguageForCurrentDomainInSettings(settings: ExtensionSettings): Promise<number> {
    return CommonContentScriptHelper.getCurrentInit()
        .then(i => getDefaultLanguageForDomainInSettings(settings, i.data.auth.domain))
}

export async function getDefaultLanguageForDomain(domain: string| null): Promise<number> {
    return requestSettings().then(s => getDefaultLanguageForDomainInSettings(s, domain))
}

export async function getDefaultLanguageForProject(domain: string | null, projectId: number): Promise<number> {
    const s = await requestSettings();
    const array = getDomainEntryArray(s);
    let domainEntry = array.find(e => e.d === domain);
    // No domain entry, no default language set
    if (!domainEntry) {
        return INVALID_LANGUAGE;
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
    if (!settings.defaultLanguage) {
        return [];
    }
    return JSON.parse(atob(settings.defaultLanguage)) as DomainLanguage[];
}

function serializeDomainEntryArray(domainEntries: DomainLanguage[]): string {
    return btoa(JSON.stringify(domainEntries));
}

function saveNewLanguageSettings(settings: ExtensionSettings, array: DomainLanguage[]): void {
    settings.defaultLanguage = serializeDomainEntryArray(array);
    void chrome.storage.sync.set(settings);
}

export function setDefaultLanguageForDomain(settings: ExtensionSettings, domain: string | null, languageId: number, mode: DomainEntryMode): void {
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

export function setDefaultLanguageForProject(settings: ExtensionSettings, domain: string | null, projectId: number, languageId: number) {
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
    l: number = INVALID_LANGUAGE;
    // mode
    m: DomainEntryMode = DomainEntryMode.DISABLED;
    // Projects
    p: ProjectLanguage[] = [];

    constructor(domain: string | null, language: number = INVALID_LANGUAGE) {
        this.d = domain;
        this.l = language;
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
