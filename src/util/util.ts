import {getCurrentLanguagePair} from "./getFetchParams";

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

export function convertUrlToCurrentLanguage(url: URL): string {
    const pathSplit = url.pathname.split("/");
    pathSplit[4] = getCurrentLanguagePair();
    url.pathname = pathSplit.join("/");
    return url.toString();
}
