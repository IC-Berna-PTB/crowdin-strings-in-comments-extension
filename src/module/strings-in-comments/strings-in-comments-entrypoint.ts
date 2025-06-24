import {CrowdinComment} from "./crowdin-comment";
import {ReferencedString} from "./reference/string/referenced-string";
import {ReferencedStringId} from "./reference/string/referenced-string-id";
import {ReferencedStringActual} from "./reference/string/referenced-string-actual";
import {elementReady, parsedClass, swapClassSelector} from "../../util/util";
import {CrowdinSearchParameters} from "../../util/crowdin/crowdin-search-parameters";
import {getPhrase, getPhrases, getProjectId} from "../../util/crowdin/api/crowdin-api-client";
import {ReferencedSearchQuery} from "./reference/search-query/referenced-search-query";
import {ReferencedSearchQueryActual} from "./reference/search-query/referenced-search-query-actual";

function setupCommentElementTopDown(comment: CrowdinComment) {
    if (comment.references.length === 0) {
        return;
    }
    updateCommentElementTopDown(comment);
}
function updateCommentElementTopDown(comment: CrowdinComment) {
    const textElement = document.querySelector(comment.elementId).querySelector("span.comment-item-text")
    if (textElement === null) {
        return;
    }
    let separator = document.createElement("hr");
    separator.classList.add("csic-separator");
    textElement.appendChild(separator);
    textElement.appendChild(generateLinkList(comment));
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

async function getLinks(comment: CrowdinComment): Promise<CrowdinComment> {
    const commentPostExact = getLinksWithExactId(comment);
    return await getLinksWithCrowdinSearch(commentPostExact);
}

function getLinksWithExactId(comment: CrowdinComment): CrowdinComment {
    const regex = getUrlWithExactIdRegex()
    const references = comment.text.matchAll(regex).toArray().map(v => v.groups)
        .filter(g => g !== undefined)
        .map(g => new ReferencedStringId(parseInt(g["projectId"]), parseInt(g["identifier"])))
        .filter((entry, index, array) => isFirst(entry, index, array))
    return comment.withAppendedReferences(references);
}

async function getLinksWithCrowdinSearch(comment: CrowdinComment): Promise<CrowdinComment> {
    const regex = getUrlWithSearchQueryRegex()
    const urls = comment.text.matchAll(regex).toArray()
    const references: ReferencedSearchQuery[] = []
    await Promise.all(urls
        .map(url => url[0])
        .map(async url => ({
            url: url,
            params: await CrowdinSearchParameters.generateFromUrl(url)
        })).map(promise => promise.then(obj => references.push(
                new ReferencedSearchQuery(getProjectId(new URL(obj.url)), obj.params)))
        ))
    return comment.withAppendedReferences(references)
}

async function getApprovedTranslations(comment: CrowdinComment): Promise<CrowdinComment> {
    const references = comment.references
    const r_1 = await Promise.all(references
        .filter(r => r instanceof ReferencedStringActual || r instanceof ReferencedStringId)
        .map(async (r) => getPhrase(r)))
        .then(promises => promises.filter(r => r !== null));
    var partialComment = comment.withReplacedReferences(r_1);

    const r_2 = await Promise.all(references
        .filter(r => r instanceof ReferencedSearchQuery || r instanceof ReferencedSearchQueryActual)
        .map(async (r) => getPhrases(r)))
        .then(promises => promises.filter(r => r !== null));
    return partialComment.withAppendedReferences(r_2);
}


function getUrlWithExactIdRegex() {
    return new RegExp(`${window.location.origin}/editor/(?<projectId>\\d+)\\S+#(?<identifier>\\d+)`, 'g')
}

function getUrlWithSearchQueryRegex(): RegExp {
    return new RegExp(`${window.location.origin}/editor/(?<projectId>\\d+)\\S+#q=(?<query>\\S+)`, 'g')
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
                reloadComments();
            })
        })
}

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

function reloadComments() {
    getCommentElements()
        .map(e => cleanupElement(e))
        .filter(e => e !== undefined)
        .filter(e => notYetParsed(e))
        .map(e => markAsParsed(e))
        .map(e => new CrowdinComment(`#${e.id}`, e.querySelector(".comment-item-text")?.textContent))
        .map(async comment => await getLinks(comment))
        .map(commentPromise => commentPromise.then(p => getApprovedTranslations(p)))
        .map(commentPromise => commentPromise.then(setupCommentElementTopDown))
}

elementReady("#discussions_messages").then((element: HTMLElement) => {
    reloadComments();
    new MutationObserver(() => {
        hookDeleteButtons(element);
        hookSaveEditButtons(element);
        reloadComments();
    }).observe(element, {childList: true, subtree: true});
});
