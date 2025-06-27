import {CommentWithReferences} from "./aux-objects/comment-with-references";
import {ReferencedString} from "./aux-objects/reference/string/referenced-string";
import {ReferencedStringId} from "./aux-objects/reference/string/referenced-string-id";
import {ReferencedStringActual} from "./aux-objects/reference/string/referenced-string-actual";
import {observeElementEvenIfNotReady} from "../../util/util";
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
    textElement.querySelectorAll(".csic-loading").forEach(e => e.remove());
    textElement.appendChild(generateLinkList(comment));
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
    return Array.prototype.slice.call(discussionsMessages.querySelectorAll("li"));
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

function getLinks(comment: CommentWithReferences, currentLanguageId: number): CommentWithReferences {
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

function findUrlsInComment(comment: CommentWithReferences): URL[] {
    const parsed = new DOMParser().parseFromString(comment.htmlContent, "text/html");
    return Array.from(parsed.querySelectorAll("a"))
        .map((element) => element.href)
        .map(url => new URL(url));
}

async function getTranslations(comment: CommentWithReferences): Promise<CommentWithReferences> {
    const references = comment.references
    const r_1 = await Promise.all(references
        .filter(r => r instanceof ReferencedStringActual || r instanceof ReferencedStringId)
        .map(async (r) => processReferencedString(r)))
        .then(promises => promises.filter(r => r !== null));
    const partialComment = comment.withReplacedReferences(r_1);

    const r_2 = await Promise.all(references
        .filter(r => r instanceof ReferencedSearchQuery || r instanceof ReferencedSearchQueryActual)
        .map(async (r) => processReferencedSearchQuery(r)))
        .then(promises => promises.filter(r => r !== null));
    return partialComment.withAppendedReferences(r_2);
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

function cleanupElement(e: HTMLElement): HTMLElement | undefined {
    if (e.querySelector(".deleted-comment") !== null) {
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

async function reloadComments(): Promise<void> {
    const currentLanguageId = await getCurrentLanguageId();
    getCommentElements()
        .map(e => cleanupElement(e))
        .filter(e => e !== undefined)
        .filter(e => e.id !== nonPersistedCommentId)
        .filter(e => notYetParsed(e))
        .map(e => markAsParsed(e))
        .map(e => new CommentWithReferences(`#${e.id}`, e.querySelector(".comment-item-text")?.innerHTML))
        .filter(comment => comment.elementId !== nonPersistedCommentId)
        .map(comment => getLinks(comment, currentLanguageId))
        .map(comment => markAsLoading(comment))
        .map(comment => getTranslations(comment))
        .map(commentPromise => commentPromise.then(setupCommentElementTopDown))
}

observeElementEvenIfNotReady("#discussions_messages", (element: HTMLElement) => {
    void getCurrentLanguageId(); //preload the language id
    void reloadComments();
    new MutationObserver(() => {
        hookDeleteButtons(element);
        hookSaveEditButtons(element);
        void reloadComments();
    }).observe(element, {childList: true, subtree: true});
});

const originalUrl = new URL(window.location.toString());

function checkIfThereIsFallbackForUrl(disconnectObserver: () => void) {
    disconnectObserver();
    let csicKey = originalUrl.searchParams.get("csic-key");
    let fileId = getFileId(originalUrl);
    if (csicKey && fileId !== "all") {
        const ref = new ReferencedStringId(getProjectId(originalUrl),
            parseInt(originalUrl.hash.replace("#", "")),
            getFileId(originalUrl) as number,
            csicKey);

        getCurrentLanguageId()
            .then(l => ref.toCrowdinSearchParametersBasic(l))
            .then(param => getFallback(param))
            .then(result => {
                if (result) {
                    const newUrl = new URL(originalUrl);
                    newUrl.hash = result.getStringId().toString();
                    window.postMessage({
                        identifier: ExtensionMessageId.NOTIFICATION_SUCCESS,
                        message: `Found exact string using token ${ref.getFallbackKey()} in URL. Redirecting...`,
                    } as ExtensionMessage<string>)
                    setTimeout(() => window.location.href = newUrl.href, 2000);
                }
            })
    }
}

if (window.location.pathname.split("/")[1] === "editor") {
    observeElementEvenIfNotReady("#jGrowl", (element: HTMLElement, disconnectObserver: () => void) => {
        if (element.textContent.includes("The string is unavailable for the current language, was deleted, or doesn't exist")) {
            checkIfThereIsFallbackForUrl(disconnectObserver);
        }
    })

}

function injectScript(file_path: string, tag: string) {
    const node = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
    script.setAttribute('type'
        , 'text/javascript');
    script.setAttribute('src'
        , file_path);
    node.appendChild(script);

}
injectScript(chrome.runtime.getURL('strings-in-comments-inject.js'), 'body');

window.addEventListener('message', e => {
    if (e.data.identifier === ExtensionMessageId.LANGUAGE_ID && typeof e.data.message === "number") {
        console.log(e.data.message);
        console.log(`pegamos o idioma, e ele é ID: ${e.data.message}`)
    }
})
