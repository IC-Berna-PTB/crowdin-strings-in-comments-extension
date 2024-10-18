import {CrowdinComment} from "./crowdin-comment";
import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";
import {ReferencedStringActual} from "./referenced-string-actual";
import {CrowdinPhraseResponse} from "./phrase-response/crowdin-phrase-response";
import {CrowdinPhraseResponseData} from "./phrase-response/crowdin-phrase-response-data";
import {CrowdinInitResponse} from "./init-response/crowdin-init-response";

const regex = getRegex()

function updateCommentElement(comment: CrowdinComment) {
    if (comment.references.length === 0) {
        return;
    }
    const element = document.getElementById(comment.elementId).getElementsByClassName("comment-item-text")[0]
    if (element === null) {
        return;
    }
    element.innerHTML = comment.references
        .filter(r => r instanceof ReferencedStringActual)
        .filter(r => r.translation !== undefined)
        .map(r => `<div>${r.translation}</div>`)
        .join("<br>")
}

getCommentElements()
    .map(e => new CrowdinComment(e.id, Array.prototype.slice.call(e.getElementsByClassName("comment-item-text"))[0].innerText))
    .map(comment => getLinks(comment, regex))
    .map(comment => getApprovedTranslations(comment))
    .map(commentPromise => commentPromise.then(updateCommentElement))


function getCommentElements(): HTMLElement[] {
    const discussionsMessages = document.getElementById("discussions_messages");
    if (discussionsMessages === null) {
        return [];
    }
    return Array.prototype.slice.call(discussionsMessages.getElementsByTagName("li"));
}

function isFirst(entry: ReferencedString, index: number, array: ReferencedString[]) {
    for (let i = 0; i < index; i++) {
        let curr = array[i];
        if (curr.getProjectId() === entry.getProjectId() && curr.getStringId() === entry.getStringId()) {
            return false;
        }
    }
    return true;
}

function getLinks(comment: CrowdinComment, regex: RegExp): CrowdinComment {
    const references = comment.text.matchAll(regex).toArray().map(v => v.groups)
        .filter(g => g !== undefined)
        .map(g => new ReferencedStringId(parseInt(g["projectId"]), parseInt(g["identifier"])))
        .filter((entry, index, array) => isFirst(entry, index, array))
    return comment.withReferences(references);
}

async function getApprovedTranslations(comment: CrowdinComment): Promise<CrowdinComment> {
    const r_1 = await Promise.all(comment.references.map(async (r) => getPhrase(r)));
    return comment.withReferences(r_1);
}

async function getPhrase(referencedString: ReferencedString): Promise<ReferencedString> {
    return await fetch(getPhraseUrl(referencedString.getProjectId(), await getLanguageId(referencedString.getProjectId()), referencedString.getStringId()), {credentials: "include", headers: { "X-Csrf-Token": getCsrfToken() }})
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinPhraseResponse)
        .then(r => r.data)
        .then(r => {
            if (r.success) {
                return r;
            }
            throw new Error(`Could not retrieve translation for project ${referencedString.getProjectId()} and string ${referencedString.getStringId()}`)
        })
        .then(r => new ReferencedStringActual(referencedString.getProjectId(), referencedString.getStringId(), "", r.top_suggestion))

}
function getPhraseUrl(projectId: number, languageId: number, stringId: number) {
    let s = `${window.location.origin}/backend/translation/phrase?project_id=${projectId}&target_language_id=${languageId}&translation_id=${stringId}`;
    console.log(s);
    return s;
}

function getRegex() {
    return new RegExp(`${window.location.origin}/editor/(?<projectId>\\d+)\\S+#(?<identifier>\\d+)`, 'g')
}

async function getLanguageId(projectId: number): Promise<number> {
    //@ts-ignore
    const languages = window.location.pathname.split("/")[4];
    const targetLanguage = languages.split("-")[1];
    return fetch(`${window.location.origin}/backend/editor/init?editor_mode=translate&project_id=${projectId}&file_id=all&languages=${languages}`, {credentials: "include", headers: { "X-Csrf-Token": getCsrfToken() }})
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinInitResponse)
        .then(r => r.data)
        .then(r => r.init_editor)
        .then(r => r.target_language)
        .then(r => r.id)
}

function getCsrfToken() {
    const csrfTokenRegex = /csrf_token=(\S+);?/
    let match = document.cookie.split(" ").map(c => c.match(csrfTokenRegex))!?.find(c => c !== null);
    if (match === undefined) {
        throw new Error(`Could not parse Csrf token: ${match}`);
    }
    return match[1];
}

function elementReady(selector: string) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) {
            resolve(el);
        }

        new MutationObserver((mutationRecords, observer) => {
            Array.from(document.querySelectorAll(selector)).forEach(element => {
                resolve(element);
                observer.disconnect();
            });
        })
            .observe(document.documentElement, {
                childList: true,
                subtree: true
            });
    });
}

elementReady("#discussions_messages").then((element: HTMLElement) => {
    reload();
    new MutationObserver((mutationRecords, observer) => {
        reload();
    }).observe(element, {childList: true, subtree: true});
});

function reload() {
    getCommentElements()
        .map(e => new CrowdinComment(e.id, Array.prototype.slice.call(e.getElementsByClassName("comment-item-text"))[0].innerText))
        .map(comment => getLinks(comment, regex))
        .map(comment => getApprovedTranslations(comment))
        .map(commentPromise => commentPromise.then(updateCommentElement))
}