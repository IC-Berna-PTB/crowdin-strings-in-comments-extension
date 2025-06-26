import {CrowdinComment} from "./crowdin-comment";
import {ReferencedString} from "./reference/string/referenced-string";
import {ReferencedStringId} from "./reference/string/referenced-string-id";
import {ReferencedStringActual} from "./reference/string/referenced-string-actual";
import {elementReady, parsedClass, swapClassSelector} from "../../util/util";
import {CrowdinSearchParameters, CrowdinSearchQueryType} from "../../util/crowdin/crowdin-search-parameters";
import {getCurrentLanguageId, getPhrase, getPhrases, getProjectId} from "../../util/crowdin/api/crowdin-api-client";
import {ReferencedSearchQuery} from "./reference/search-query/referenced-search-query";
import {ReferencedSearchQueryActual} from "./reference/search-query/referenced-search-query-actual";
import {Reference} from "./reference/reference";

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
    textElement.querySelectorAll(".csic-loading").forEach(e => e.remove());
    textElement.appendChild(generateLinkList(comment));
}


function  generateLinkList(comment: CrowdinComment): HTMLElement {
    return comment.references
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

function getLinks(comment: CrowdinComment, currentLanguageId: number): CrowdinComment {
    const urls = findUrlsInComment(comment);
    const exactReferences = getLinksWithExactId(urls);
    const queryReferences = getLinksWithCrowdinSearch(urls, currentLanguageId);
    return comment.withReplacedReferences(exactReferences.concat(queryReferences))
}

function getLinksWithExactId(urls: URL[]): Reference[] {
    return urls
        .filter(url => urlHasExactStringId(url))
        .map(url => ReferencedStringId.fromUrl(url))
        .filter((entry, index, array) => isFirst(entry, index, array))
}

function getLinksWithCrowdinSearch(urls: URL[], currentLanguageId: number): Reference[] {
    const references: ReferencedSearchQuery[] = []
    urls
        .map(url => url)
        .filter(url => url.hash.match(/^#q=\S+$/) || urlIsForAdvancedOrCroQLFiltering(url))
        .map(url => ({
            url: url,
            params: CrowdinSearchParameters.fromUrl(url, currentLanguageId)
        })).map(obj => references.push(
            new ReferencedSearchQuery(getProjectId(new URL(obj.url)),
                obj.params,
                new URL(obj.url)))
        )
    return references;
}

function urlHasExactStringId(url: URL) {
    return url.hash.match(/^#\d+$/);
}

function urlIsForAdvancedOrCroQLFiltering(url: URL) {
    const value = parseInt(url.searchParams.get("value"));
    if (urlHasExactStringId(url)) {
        return false;
    }
    return value === CrowdinSearchQueryType.CROQL_FILTERING || value === CrowdinSearchQueryType.ADVANCED_FILTERING;
}

function findUrlsInComment(comment: CrowdinComment): URL[] {
    const parsed = new DOMParser().parseFromString(comment.htmlContent, "text/html");
    return Array.from(parsed.querySelectorAll("a"))
        .map((element) => element.href)
        .map(url => new URL(url));
}

async function getApprovedTranslations(comment: CrowdinComment): Promise<CrowdinComment> {
    const references = comment.references
    const r_1 = await Promise.all(references
        .filter(r => r instanceof ReferencedStringActual || r instanceof ReferencedStringId)
        .map(async (r) => getPhrase(r)))
        .then(promises => promises.filter(r => r !== null));
    const partialComment = comment.withReplacedReferences(r_1);

    const r_2 = await Promise.all(references
        .filter(r => r instanceof ReferencedSearchQuery || r instanceof ReferencedSearchQueryActual)
        .map(async (r) => getPhrases(r)))
        .then(promises => promises.filter(r => r !== null));
    return partialComment.withAppendedReferences(r_2);
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
                void reloadComments();
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

function markAsLoading(comment: CrowdinComment): CrowdinComment {
    const textElement = document.querySelector(comment.elementId).querySelector("span.comment-item-text")
    if (textElement === null) {
        return comment;
    }
    let separator = document.createElement("hr");
    separator.classList.add("csic-separator");
    textElement.appendChild(separator);
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("csic-loading");
    loadingDiv.append("Loading...");
    textElement.appendChild(loadingDiv);
    return comment;
}

async function reloadComments(): Promise<void> {
    const currentLanguageId = await getCurrentLanguageId();
    getCommentElements()
        .map(e => cleanupElement(e))
        .filter(e => e !== undefined)
        .filter(e => notYetParsed(e))
        .map(e => markAsParsed(e))
        .map(e => new CrowdinComment(`#${e.id}`, e.querySelector(".comment-item-text")?.innerHTML))
        .map(comment => getLinks(comment, currentLanguageId))
        .map(comment => markAsLoading(comment))
        .map(comment => getApprovedTranslations(comment))
        .map(commentPromise => commentPromise.then(setupCommentElementTopDown))
}

elementReady("#discussions_messages").then((element: HTMLElement) => {
    void reloadComments();
    new MutationObserver(() => {
        hookDeleteButtons(element);
        hookSaveEditButtons(element);
        void reloadComments();
    }).observe(element, {childList: true, subtree: true});
});
