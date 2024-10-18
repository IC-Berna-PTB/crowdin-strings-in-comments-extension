import {CrowdinComment} from "./crowdin-comment";
import {ReferencedString} from "./referenced-string";
import {ReferencedStringId} from "./referenced-string-id";
import {ReferencedStringActual} from "./referenced-string-actual";
import {CrowdinPhraseResponse} from "./phrase-response/crowdin-phrase-response";
import {CrowdinInitResponse} from "./init-response/crowdin-init-response";

function setupCommentElement(comment: CrowdinComment) {
    if (comment.references.length === 0) {
        return;
    }
    let destElement = document.querySelector(comment.elementId).querySelector(".comment-item-container");
    if (destElement.querySelector(".swap-comment-and-strings") !== null) {
        return;
    }
    let toBeAppendedElement = document.createElement("div");
    toBeAppendedElement.classList.add("swap-comment-and-strings", "comment-item-date");
    toBeAppendedElement.innerText = "See original comment";
    toBeAppendedElement.addEventListener("click", () => updateCommentElement(comment))
    destElement.innerHTML += "<br>"
    destElement.append(toBeAppendedElement);
    updateCommentElement(comment);
}

const regex = getRegex()

function updateCommentElement(comment: CrowdinComment) {
    const textElement = document.querySelector(comment.elementId).querySelector(".comment-item-text")
    if (textElement === null) {
        return;
    }
    let linkElement = document.querySelector(comment.elementId).querySelector(".swap-comment-and-strings") as HTMLElement;
    if (comment.showingStrings) {
        linkElement.innerText = "See linked strings";
        textElement.innerHTML = comment.text;
    } else {
        linkElement.innerText = "See original comment";
        textElement.innerHTML = generateLinkList(comment);
    }
    comment.showingStrings = !comment.showingStrings;
}

function generateLinkList(comment: CrowdinComment): string {
    return comment.references
        .filter(r => r instanceof ReferencedStringActual)
        .filter(r => r.translation !== undefined)
        .map(r => `
<div>
    <span class="term_item" onclick='navigator.clipboard.writeText("${r.translation}")'>${r.translation}</span>
</div>
<div>
    <span class="suggestion_tm_source" style="font-style: italic;">${r.source}</span>
</div>`)
        .join("<br>")
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

function getFetchParams(): RequestInit {
    return {
        credentials: "include",
        headers: {"X-Csrf-Token": getCsrfToken()}
    };
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
        .then(r => new ReferencedStringActual(referencedString.getProjectId(), referencedString.getStringId(), r.translation.text, r.top_suggestion))
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

function getCsrfToken() {
    const csrfTokenRegex = /csrf_token=(\S+)/
    let match = document.cookie.split("; ").map(c => c.match(csrfTokenRegex))!?.find(c => c !== null);
    if (match === undefined) {
        throw new Error(`Could not parse Csrf token: ${match}`);
    }
    return match[1];
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

elementReady("#discussions_messages").then((element: HTMLElement) => {
    reload();
    new MutationObserver(() => {
        reload();
    }).observe(element, {childList: true, subtree: true});
});

function reload() {
    getCommentElements()
        .map(e => new CrowdinComment(`#${e.id}`, e.querySelector(".comment-item-text").innerHTML))
        .map(comment => getLinks(comment, regex))
        .map(comment => getApprovedTranslations(comment))
        .map(commentPromise => commentPromise.then(setupCommentElement))
}