import {
    CrowdinPhraseResponseTranslationStatus
} from "./crowdin/api/phrase-response/crowdin-phrase-response-translation-status";

export function getFetchParams(): RequestInit {
    const headers = new Headers();
    headers.append("X-Csrf-Token", getCsrfToken());
    return {
        credentials: "include",
        headers: headers,
    };
}

export function getCsrfToken() {
    const csrfTokenRegex = /csrf_token=(\S+)/
    let match = document.cookie.split("; ").map(c => c.match(csrfTokenRegex))!?.find(c => c !== null);
    if (match === undefined) {
        throw new Error(`Could not parse Csrf token: ${match}`);
    }
    return match[1];
}

export const swapClassSelector = ".swap-comment-and-strings";
export const parsedClass = "csic-parsed";

export type TranslationStatus = "not-translated" | "translated" | "approved";

export function convertCrowdinTranslationStatus(status: CrowdinPhraseResponseTranslationStatus): TranslationStatus {
    if (status.approved) {
        return "approved";
    }
    if (status.translated) {
        return "translated";
    }
    return "not-translated";
}

export function elementReady(selector: string) {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) {
            resolve(el);
        }

        new MutationObserver((_mutationRecords, observer) => {
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
