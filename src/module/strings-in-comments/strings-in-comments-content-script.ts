import {CommentWithReferences} from "./aux-objects/comment-with-references";
import {ReferencedString} from "./aux-objects/reference/string/referenced-string";
import {ReferencedStringId} from "./aux-objects/reference/string/referenced-string-id";
import {ReferencedStringActual} from "./aux-objects/reference/string/referenced-string-actual";
import {injectExtensionScript, listenToExtensionMessage, observeElementEvenIfNotReady} from "../../util/util";
import {CrowdinSearchParameters, CrowdinSearchQueryType} from "../../util/crowdin/crowdin-search-parameters";
import {getFileId, getProjectId} from "../../apis/crowdin/crowdin-main";
import {ReferencedSearchQuery} from "./aux-objects/reference/search-query/referenced-search-query";
import {ReferencedSearchQueryActual} from "./aux-objects/reference/search-query/referenced-search-query-actual";
import {isHtmleable, Reference} from "./aux-objects/reference/reference";
import {getCurrentLanguageId} from "../../apis/crowdin/crowdin-aux-functions";
import {nonPersistedCommentId, parsedClass} from "./constants";
import {getFallback, processReferencedString} from "./string/referenced-string-processing";
import {processReferencedSearchQuery} from "./search-query/referenced-search-query-processing";
import {ExtensionMessage, ExtensionMessageId} from "./aux-objects/extension-message";
import {CrowdinUserProjects} from "../../util/crowdin/api/user-projects/crowdin-user-projects";
import {ReferencedCsHighlightReel} from "./aux-objects/reference/cs-highlight-reel/referenced-cs-highlight-reel";

function setupCommentElementTopDown(comment: CommentWithReferences) {
    if (comment.references.length === 0) {
        const textElement = document.querySelector(comment.elementId).querySelector("span.comment-item-text");
        textElement.querySelectorAll(".csic-container").forEach(c => c.remove());
        return;
    }
    updateCommentElementTopDown(comment);
}
function updateCommentElementTopDown(comment: CommentWithReferences) {
    const textElement = document.querySelector(comment.elementId).querySelector("span.comment-item-text")
    if (textElement === null) {
        return;
    }
    let containerElement = textElement.querySelector(".csic-container");
    if (containerElement !== null) {
        containerElement.querySelectorAll(".csic-loading").forEach(e => e.remove());
    } else {
        containerElement = document.createElement("div");
        containerElement.classList.add("csic-container");
        let separator = document.createElement("hr");
        separator.classList.add("csic-separator");
        containerElement.appendChild(separator);
    }
    containerElement.appendChild(generateLinkList(comment));
}


function  generateLinkList(comment: CommentWithReferences): HTMLElement {
    return comment.references
        .filter(r => isHtmleable(r))
        .map(r => r.generateHtml())
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
    return Array.from(discussionsMessages.querySelectorAll("li"))
        .filter(node => node.hasAttribute("id"))
        .filter(node => node.id.startsWith("discussion"));
}

function isFirst(entry: ReferencedString, index: number, array: ReferencedString[]) {
    for (let i = 0; i < index; i++) {
        let curr = array[i];
        if (curr.getProjectId() === entry.getProjectId()
            // If they have the same string ID, it's the same
            && (curr.getStringId() === entry.getStringId()
                // or, if the current one has a fallback key and file ID...
                || ((curr.getFallbackKey() && curr.getFallbackFileId())
                    // and they are equal to those in a previous reference, it's the same string
                    && (curr.getFallbackKey() === entry.getFallbackKey() && curr.getFallbackFileId() === entry.getFallbackFileId())))) {
            return false;
        }
    }
    return true;
}

async function getLinks(comment: CommentWithReferences, currentLanguageId: number): Promise<CommentWithReferences> {
    const urls = findUrlsInComment(comment);
    const exactReferences = getLinksWithExactId(urls);
    const queryReferences = await getLinksWithCrowdinSearch(urls, currentLanguageId);
    const csHighlightReelReferences = getLinksWithCsHighlightReelUrl(urls);
    return comment.withReplacedReferences(exactReferences.concat(queryReferences).concat(csHighlightReelReferences));
}

function urlIsForCurrentCrowdinInstance(url: URL): boolean {
    const currentCrowdinInstance = window.location.origin;
    const urlOrigin = url.origin;
    return currentCrowdinInstance === urlOrigin;
}

function getLinksWithExactId(urls: URL[]): Reference[] {
    return urls
        .filter(url => urlIsForCurrentCrowdinInstance(url))
        .filter(url => urlHasExactStringId(url))
        .map(url => ReferencedStringId.fromUrl(url))
        .filter((entry, index, array) => isFirst(entry, index, array))
}

async function getLinksWithCrowdinSearch(urls: URL[], currentLanguageId: number): Promise<Reference[]> {
    const parameters = urls
        .map(url => url)
        .filter(url => urlIsForCurrentCrowdinInstance(url))
        .filter(url => url.hash.match(/^#q=\S+$/) || urlIsForAdvancedOrCroQLFiltering(url))
        .map(async url => ({
            url: url,
            params: await CrowdinSearchParameters.fromUrl(url, currentLanguageId)
        }))
    const realizedParameters = await Promise.all(parameters);
    return realizedParameters
        .filter(p => p.params.project_id)
        .map(p => new ReferencedSearchQuery(p.params.project_id, p.params, p.url));
}

function urlHasExactStringId(url: URL) {
    return url.hash.match(/^#\d+$/);
}

function urlIsForAdvancedOrCroQLFiltering(url: URL): boolean {
    const value = parseInt(url.searchParams.get("value"));
    if (urlHasExactStringId(url)) {
        return false;
    }
    return value === CrowdinSearchQueryType.CROQL_FILTERING || value === CrowdinSearchQueryType.ADVANCED_FILTERING;
}

function getLinksWithCsHighlightReelUrl(urls: URL[]): Reference[] {
    return urls
        .filter(url => url.origin === "https://cdn.steamstatic.com")
        .filter(url => url.pathname.startsWith("/apps/csgo/videos/highlightreels/"))
        .filter(url => url.pathname.endsWith("_1080p.webm"))
        .filter(url => url.pathname.split("/").length === 8)
        .map(url => new ReferencedCsHighlightReel(url))
}

function findUrlsInComment(comment: CommentWithReferences): URL[] {
    const parsed = new DOMParser().parseFromString(comment.htmlContent, "text/html");
    return Array.from(parsed.querySelectorAll("a"))
        .filter(element => !element.classList.contains("user-info"))
        .map((element) => element.href)
        .map(url => new URL(url));
}

async function getTranslations(comment: CommentWithReferences): Promise<CommentWithReferences> {
    const references = comment.references
    const r_1: Reference[] = await Promise.all(references
        .filter(r => r instanceof ReferencedStringActual || r instanceof ReferencedStringId)
        .map(async (r) => processReferencedString(r)))
        .then(promises => promises.filter(r => r));

    const r_2: Reference[] = await Promise.all(references
        .filter(r => r instanceof ReferencedSearchQuery || r instanceof ReferencedSearchQueryActual)
        .map(async (r) => processReferencedSearchQuery(r)))
        .then(promises => promises.filter(r => r));

    const r_3 = references.filter(r => r instanceof ReferencedCsHighlightReel);
    return comment.withReplacedReferences(r_1.concat(r_2).concat(r_3));
}
function hookDeleteButtons(element: HTMLElement) {
    Array.from(element.querySelectorAll(".static-icon-trash"))
        .map(e => e.parentElement)
        .filter(e => !e.classList.contains("hooked"))
        .forEach(e => {
            e.classList.add("hooked")
        })
}

function hookSaveEditButtons(element: HTMLElement) {
    element.querySelectorAll(".edit-comment-mode")
        .forEach(e => {
            e.querySelector("button.save_comment").addEventListener("click", () => {
                e.classList.remove(parsedClass);
                void reloadComments();
            })
        })
}

function cleanupElement(e: HTMLElement, forced: boolean = false): HTMLElement | undefined {
    if (forced || e.querySelector(".deleted-comment") !== null) {
        e.classList.remove(parsedClass);
        e.querySelector(".csic-container")?.remove();
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

function markAsLoading(comment: CommentWithReferences): CommentWithReferences {
    let commentElement = document.querySelector(comment.elementId);
    const textElement = commentElement.querySelector("span.comment-item-text")
    if (textElement === null) {
        return comment;
    }
    let container = document.createElement("div");
    container.classList.add("csic-container");
    let separator = document.createElement("hr");
    separator.classList.add("csic-separator");
    container.appendChild(separator);
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("csic-loading");
    loadingDiv.append("Loading...");
    container.appendChild(loadingDiv);
    textElement.appendChild(container);
    return comment;
}

async function reloadComments(forced: boolean = false): Promise<void> {
    const currentLanguageId = await getCurrentLanguageId();
    console.log(currentLanguageId);
    getCommentElements()
        .map(e => cleanupElement(e, forced))
        .filter(e => e !== undefined)
        .filter(e => e.id !== nonPersistedCommentId)
        .filter(e => notYetParsed(e))
        .map(e => markAsParsed(e))
        .map(e => new CommentWithReferences(`#${e.id}`, e.querySelector(".comment-item-text")?.innerHTML))
        .filter(comment => comment.elementId !== nonPersistedCommentId)
        .map(async comment => await getLinks(comment, currentLanguageId))
        .map(commentPromise => commentPromise.then(c => markAsLoading(c)))
        .map(commentPromise => commentPromise.then(c => getTranslations(c)))
        .map(commentPromise => commentPromise.then(setupCommentElementTopDown))
}

observeElementEvenIfNotReady("#discussions_messages", (element: HTMLElement, disconnect) => {
    void getCurrentLanguageId(); //preload the language id
    void CrowdinUserProjects.reloadUserProjects(); // preload user projects
    void reloadComments();
    disconnect();
    new MutationObserver(() => {
        hookDeleteButtons(element);
        hookSaveEditButtons(element);
        void reloadComments();
    }).observe(element, {childList: true, subtree: true});
});

const originalUrl = new URL(window.location.toString());

async function checkIfThereIsFallbackForUrl(disconnectObserver: () => void) {
    disconnectObserver();
    let csicKey = originalUrl.searchParams.get("csic-key");
    let fileId = getFileId(originalUrl);
    if (csicKey && fileId !== "all") {
        postMessage({identifier: ExtensionMessageId.NOTIFICATION_NOTICE, message: `Checking if there's still a string with token ${csicKey}`} as ExtensionMessage<string>);
        const ref = new ReferencedStringId(await getProjectId(originalUrl),
            parseInt(originalUrl.hash.replace("#", "")),
            getFileId(originalUrl) as number,
            csicKey);

        getCurrentLanguageId()
            .then(l => ref.toCrowdinSearchParametersBasic(l))
            .then(param => getFallback(param))
            .then(result => {
                if (result) {
                    window.postMessage({
                        identifier: ExtensionMessageId.NOTIFICATION_SUCCESS,
                        message: `Found exact string using token ${ref.getFallbackKey()} in URL! Search updated with new ID.`,
                    } as ExtensionMessage<string>);
                    window.postMessage({
                        identifier: ExtensionMessageId.SET_SEARCH_FIELD_VALUE,
                        message: result.getStringId().toString()
                    } as ExtensionMessage<string>)
                }
            })
    }
}

if (window.location.pathname.split("/")[1] === "editor") {
    observeElementEvenIfNotReady("#jGrowl", (element: HTMLElement, disconnectObserver: () => void) => {
        if (element.textContent.includes("The string is unavailable for the current language, was deleted, or doesn't exist")) {
            checkIfThereIsFallbackForUrl(disconnectObserver).then(() => {});
        }
    })

}

listenToExtensionMessage<number>(ExtensionMessageId.EDITOR_LANGUAGE_CHANGED, () => reloadComments(true));

injectExtensionScript('strings-in-comments-inject.js');