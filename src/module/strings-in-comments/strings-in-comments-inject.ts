import {ExtensionMessageId} from "./aux-objects/extension-message";
import {CrowdinPhrasesResponse} from "../../apis/crowdin/multiple-phrases/crowdin-phrases-response";
import {listenToExtensionMessage, observeElementEvenIfNotReady} from "../../util/util";

let altDown = false;

const updateStringUrlInterval = setInterval(() => {
    //@ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation) {
        clearInterval(updateStringUrlInterval);
        //@ts-ignore
        const originalGetStringUrl = window.crowdin.helpers.translation.getStringUrl;


        //@ts-ignore
        window.crowdin.helpers.translation.getStringUrl = (id: number, languageless: boolean = false): string => {
            //@ts-ignore
            const url = new URL(originalGetStringUrl.apply(window.crowdin.helpers.translation, [id]));
            const stringId = parseInt(url.hash.replace("#", ""));
            if (phrases) {
                const stringData = phrases.data.phrases.find(p => p.id === stringId);
                if (stringData && stringData.key) {
                    url.searchParams.append("csic-key", stringData.key);
                    if (url.pathname.split("/").length === 3 && stringData.file_id) {
                        url.pathname = url.pathname + `/${stringData.file_id}`
                    }
                }
            }
            if (languageless) {
                let splitPath = url.pathname.split("/");
                let languageless = splitPath.toSpliced(4);
                url.pathname = languageless.join("/")
            }
            return url.toString();
        }
        clearInterval(updateStringUrlInterval);
    } else {
    }
}, 500);

let phrases: CrowdinPhrasesResponse = null;

function altStuff(e: KeyboardEvent, button: HTMLElement) {
    if (e.altKey) {
        altDown = true;
        button.textContent = "Copy Language-Agnostic String URL"
    } else {
        altDown = false;
        button.textContent = "Copy String URL";
    }
}

const insertCopyWithoutLanguageForCurrentStringInterval = setInterval(() => {
    const buttonElement = document.querySelector("#string-options-link");
    const listElement = document.querySelector("#file_options");
    // @ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation && buttonElement && listElement) {
        clearInterval(insertCopyWithoutLanguageForCurrentStringInterval);
        const regularCopyButton = [...listElement.querySelectorAll("li")]
            .find(e => e.textContent === "Copy String URL");
        const languagelessCopy = document.createElement("li");
        regularCopyButton.after(languagelessCopy);
        const languagelessCopyAnchor = document.createElement("a");
        languagelessCopy.append(languagelessCopyAnchor);
        languagelessCopyAnchor.append("Copy Language-Agnostic URL");
        languagelessCopyAnchor.tabIndex = -1;
        languagelessCopyAnchor.href = "#";
        languagelessCopyAnchor.addEventListener("click", (e) => {
            // @ts-ignore
            crowdin.clipboard.successMessage = "Language-Agnostic URL copied to clipboard!";
            // @ts-ignore
            crowdin.clipboard.copy(crowdin.helpers.translation.getStringUrl(null, true));
            e.preventDefault();
        })
    }
}, 500)

const insertCopyWithoutLanguageForStringListInterval = setInterval(() => {
    const listElement = document.querySelector("#source-string-context-menu");
    // @ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation && window.crowdin.editor && listElement && listElement) {
        clearInterval(insertCopyWithoutLanguageForStringListInterval);
        // @ts-ignore
        if (crowdin.editor.modeTranslate()) {
            new MutationObserver((m, o) => {
                const button = listElement.querySelector(".contexify_item[data-testid='copyStringUrl']");

                const newButton = document.createElement("div");
                button.after(newButton);
                newButton.classList.add("contexify_item");
                newButton.tabIndex = -1;
                newButton.ariaDisabled = "false";
                newButton.role = "menuitem";

                const newButtonLabel = document.createElement("div");
                newButton.append(newButtonLabel);
                newButtonLabel.classList.add("contexify_itemContent");
                newButtonLabel.textContent = "Copy Language-Agnostic URL";

                newButton.addEventListener("click", (e) => {
                    const element = Array.from(document.querySelectorAll("li.context-menu")).find(e => e.id.startsWith("phrase_"));
                    if (element) {
                        const id = parseInt(element.id.replace("phrase_", ""))
                        // @ts-ignore
                        crowdin.clipboard.copy(crowdin.helpers.translation.getStringUrl(id, true))
                    }
                })
            })
                .observe(listElement, {childList: true})
        }
    }
}, 500)

/*
            function b(e) {
              var t = e.props;
              (
                crowdin.editor.modeTranslate() ||
                1 === crowdin.phrases.get_selected_translations_id().length
              ) &&
              crowdin.clipboard.copy(crowdin.helpers.translation.getStringUrl(t.translation.id))
            }

 */

$(document).ajaxSuccess((_e: JQuery.TriggeredEvent, _xhr: JQuery.jqXHR, options: JQuery.AjaxSettings, data: JQuery.PlainObject) => {
    if (options.url === ("/backend/phrases") && (options.type === "POST" || options.method === "POST")) {
        phrases = data as CrowdinPhrasesResponse;
    }
});

listenToExtensionMessage<string>(ExtensionMessageId.REPLACE_TEXT_IN_CARET, m => {
    // @ts-ignore
    crowdin.translation.insertValue(m);
})

listenToExtensionMessage<string>(ExtensionMessageId.SET_SEARCH_FIELD_VALUE, m => {
    // @ts-ignore
    crowdin.phrases.search(m);
    let searchBar = document.querySelector("#editor_search_bar") as HTMLInputElement;
    if (searchBar) {
        searchBar.value = m;
    }
})