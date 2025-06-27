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

export function observeElementEvenIfNotReady(selector: string, observer: (element: HTMLElement, disconnect: () => void) => void): void {
    elementReady(selector).then((element: HTMLElement) => {
        const mutationObserver = new MutationObserver(() => observer(element, () => mutationObserver.disconnect()));
        mutationObserver.observe(element, { childList: true, subtree: true })
    })
}

export function convertUrlToCurrentLanguage(url: URL): string {
    const pathSplit = url.pathname.split("/");
    pathSplit[4] = getCurrentLanguagePair();
    url.pathname = pathSplit.join("/");
    return url.toString();
}
