import {getCurrentLanguagePair} from "./getFetchParams";
import {ExtensionMessage, ExtensionMessageId} from "../module/strings-in-comments/aux-objects/extension-message";
import {ClassConstructor, plainToInstance} from "class-transformer";

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

export function injectExtensionScript(internalFilePath: string, tag: string = "head") {
    const node = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
    script.setAttribute('type'
        , 'text/javascript');
    script.setAttribute('src'
        , chrome.runtime.getURL(internalFilePath));
    node.appendChild(script);
}

export function postExtensionMessage<T>(id: ExtensionMessageId, message: T) {
    postMessage({
        identifier: id,
        message: message
    } as ExtensionMessage<T>)
}

export function listenToExtensionMessage<T>(id: ExtensionMessageId, listener: (message: T) => void) {
    window.addEventListener("message", (e: MessageEvent<ExtensionMessage<T>>) => {
        if (e.data.identifier === id) {
            listener(e.data.message);
        }
    })
}

export function objectToBase64(object: unknown): string {
    return btoa(JSON.stringify(object));
}

export function base64ToObject<T>(base64: string, clazz: ClassConstructor<T>): T {
    return plainToInstance<T, unknown>(clazz, JSON.parse(atob(base64)));
}
