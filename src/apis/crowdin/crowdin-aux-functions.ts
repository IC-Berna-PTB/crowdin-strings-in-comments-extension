import {getInit} from "./init/crowdin-init-call";

export async function getCurrentLanguageId(): Promise<number> {
    const languagePair = window.location.pathname.split("/")[4];
    if (languagePair != lastLanguagePair) {
        return getInit(languagePair)
            .then(r => r.data)
            .then(r => r.init_editor)
            .then(r => r.target_language ?? r.out_of_scope_target_lang)
            .then(r => r.id)
            .then(r => {
                lastTargetLanguageId = r;
                lastLanguagePair = languagePair;
                return;
            })
            .then(() => lastTargetLanguageId);
    } else {
        return lastTargetLanguageId;
    }
}

let lastLanguagePair: string = "";
let lastTargetLanguageId: number = -1;

