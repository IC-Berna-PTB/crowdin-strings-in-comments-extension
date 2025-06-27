import {CrowdinTranslationStatus} from "./crowdin/api/common/crowdin-translation-status";

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

export type TranslationStatus = "not-translated" | "translated" | "approved";

export function convertCrowdinTranslationStatus(status: CrowdinTranslationStatus): TranslationStatus {
    if (status.approved) {
        return "approved";
    }
    if (status.translated) {
        return "translated";
    }
    return "not-translated";
}

export function getCurrentLanguagePair(): string {
    return window.location.pathname.split("/")[4];
}
