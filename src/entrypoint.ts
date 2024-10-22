import {CrowdinComment} from "./crowdin-comment";
import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";
import {ReferencedStringActual} from "./referenced-string-actual";
import {CrowdinPhraseResponse} from "./crowdin-api/phrase-response/crowdin-phrase-response";
import {CrowdinInitResponse} from "./crowdin-api/init-response/crowdin-init-response";
import {getFetchParams, parsedClass, swapClassSelector} from "./util";

function setupCommentElement(comment: CrowdinComment) {
    if (comment.references.length === 0) {
        return;
    }
    let destElement = document.querySelector(comment.elementId).querySelector(".comment-item-container");
    if (destElement.querySelector(swapClassSelector) !== null) {
        return;
    }
    let toBeAppendedElementWrapper = document.createElement("div");
    toBeAppendedElementWrapper.classList.add("comment-item-date");
    let toBeAppendedElement = document.createElement("a");
    toBeAppendedElement.classList.add("swap-comment-and-strings");
    toBeAppendedElement.innerText = "See original comment";
    toBeAppendedElement.style.cursor = "pointer"
    toBeAppendedElement.addEventListener("click", () => updateCommentElement(comment));
    toBeAppendedElementWrapper.append(toBeAppendedElement);
    destElement.append(toBeAppendedElementWrapper);
    updateCommentElement(comment);
}

const regex = getRegex()

function updateCommentElement(comment: CrowdinComment) {
    const textElement = document.querySelector(comment.elementId).querySelector("span.comment-item-text")
    if (textElement === null) {
        return;
    }
    let linkElement = document.querySelector(comment.elementId).querySelector(swapClassSelector) as HTMLElement;
    if (comment.showingStrings) {
        linkElement.innerText = "See linked strings";
        textElement.innerHTML = comment.text;
    } else {
        linkElement.innerText = "See original comment";
        textElement.replaceChildren(generateLinkList(comment));
    }
    comment.showingStrings = !comment.showingStrings;
}

function  generateLinkList(comment: CrowdinComment): HTMLElement {
    return comment.references
        .filter(r => r instanceof ReferencedStringActual)
        .filter(r => r.translation !== undefined)
        .map(r => r.generateHtml())
        .filter(r => r !== undefined)
        .reduce((p, c) => {
            if (p.innerText.trim().length !== 0) {
                p.appendChild(document.createElement("br"))
            }
            p.appendChild(c)
            return p;
        }, document.createElement("div"))
}


function getCommentElements(): HTMLElement[] {
    const discussionsMessages = document.querySelector("#discussions_messages");
    if (discussionsMessages === null) {
        return [];
    }
    return Array.prototype.slice.call(discussionsMessages.querySelectorAll("li"));
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
    const r_1 = await Promise.all(comment.references
        .map(async (r) => getPhrase(r)))
        .then(promises => promises.filter(r => r !== null));
    return comment.withReferences(r_1);
}


async function getPhrase(referencedString: ReferencedString): Promise<ReferencedString> {
    return await fetch(getPhraseUrl(referencedString.getProjectId(), await getLanguageId(getProjectId()), referencedString.getStringId()), getFetchParams())
        .then(r => {
            if (r.status !== 200) {
                throw new Error("User does not have access!")
            }
            return r;
        })
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinPhraseResponse)
        .then(r => r.data)
        .then(r => {
            if (r.success) {
                return r;
            }
            throw new Error(`Could not retrieve translation for project ${referencedString.getProjectId()} and string ${referencedString.getStringId()}`)
        })
        .then(r => new ReferencedStringActual(referencedString.getProjectId(),
            referencedString.getStringId(),
            r.translation.text,
            r.top_suggestion,
            (r.translation_status.approved ? "approved" : (r.translation_status.translated ? "translated" : "not-translated")),
            r.translation.key))
        .catch(() => null)

}
function getPhraseUrl(projectId: number, languageId: number, stringId: number) {
    return `${window.location.origin}/backend/translation/phrase?project_id=${projectId}&target_language_id=${languageId}&translation_id=${stringId}`;
}

function getRegex() {
    return new RegExp(`${window.location.origin}/editor/(?<projectId>\\d+)\\S+#(?<identifier>\\d+)`, 'g')
}

function getProjectId(): number {
    return parseInt(window.location.pathname.split("/")[2])
}

async function getLanguageId(projectId: number): Promise<number> {
    //@ts-ignore
    const languages = window.location.pathname.split("/")[4];
    return fetch(`${window.location.origin}/backend/editor/init?editor_mode=translate&project_id=${projectId}&file_id=all&languages=${languages}`, getFetchParams())
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinInitResponse)
        .then(r => r.data)
        .then(r => r.init_editor)
        .then(r => r.target_language)
        .then(r => r.id)
}

function elementReady(selector: string) {
    return new Promise((resolve) => {
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

function hookDeleteButtons(element: HTMLElement) {
    Array.from(element.querySelectorAll(".static-icon-trash"))
        .map(e => e.parentElement)
        .filter(e => !e.classList.contains("hooked"))
        .forEach(e => {
            e.addEventListener("click", () => {
                let li = document.querySelector(`#discussion${e.getAttribute("data-id")}`);
                li?.querySelector(swapClassSelector).parentElement?.remove();
                li?.querySelector(swapClassSelector)?.remove();
            })
            e.classList.add("hooked")
        })
}

function hookSaveEditButtons(element: HTMLElement) {
    element.querySelectorAll(".edit-comment-mode")
        .forEach(e => {
            e.querySelector("button.save_comment").addEventListener("click", () => {
                e.querySelector(swapClassSelector)?.parentElement?.remove();
                e.querySelector(swapClassSelector)?.remove();
                e.classList.remove(parsedClass);
                reload();
            })
        })
}

elementReady("#discussions_messages").then((element: HTMLElement) => {
    reload();
    new MutationObserver(() => {
        hookDeleteButtons(element);
        hookSaveEditButtons(element);
        reload();
    }).observe(element, {childList: true, subtree: true});
});

function cleanupElement(e: HTMLElement): HTMLElement | undefined {
    if (e.querySelector(".deleted-comment") !== null) {
        e.querySelector(swapClassSelector)?.remove();
        e.classList.remove(parsedClass);
        return undefined;
    }
    return e;
}

function notYetParsed(e: HTMLElement): boolean {
    return !e.classList.contains(parsedClass);
}

function markAsParsed(e: HTMLElement): HTMLElement {
    if (e.id != "discussion-1") {
        e.classList.add(parsedClass);
    }
    return e;
}

function reload() {
    getCommentElements()
        .map(e => cleanupElement(e))
        .filter(e => e !== undefined)
        .filter(e => notYetParsed(e))
        .map(e => markAsParsed(e))
        .map(e => new CrowdinComment(`#${e.id}`, e.querySelector(".comment-item-text")?.innerHTML))
        .map(comment => getLinks(comment, regex))
        .map(comment => getApprovedTranslations(comment))
        .map(commentPromise => commentPromise.then(setupCommentElement))
}