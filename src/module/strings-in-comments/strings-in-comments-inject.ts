import {ExtensionMessageId} from "./aux-objects/extension-message";
import {CrowdinPhrasesResponse} from "../../apis/crowdin/multiple-phrases/crowdin-phrases-response";
import {listenToExtensionMessage} from "../../util/util";
import {formatStringUrlToSlack} from "../../util/format-string-url-to-slack";
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

        const slackCopy = document.createElement("li");
        languagelessCopy.after(slackCopy);
        const slackCopyAnchor = document.createElement("a");
        slackCopy.append(slackCopyAnchor);
        slackCopyAnchor.append("Copy Formatted URL for Slack");
        slackCopyAnchor.tabIndex = -1;
        slackCopyAnchor.href = "#";
        slackCopyAnchor.addEventListener("click", () => {
            // @ts-ignore
            crowdin.clipboard.successMessage = "Formatted URL for Slack copied to clipboard!";
            // @ts-ignore
            const url: string = crowdin.helpers.translation.getStringUrl(null, true);
            void navigator.clipboard.write(formatStringUrlToSlack(url));
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
            new MutationObserver(() => {
                const button = listElement.querySelector(".contexify_item[data-testid='copyStringUrl']");

                const languagelessButton = document.createElement("div");
                button.after(languagelessButton);
                languagelessButton.classList.add("contexify_item");
                languagelessButton.tabIndex = -1;
                languagelessButton.ariaDisabled = "false";
                languagelessButton.role = "menuitem";

                const languagelessButtonLabel = document.createElement("div");
                languagelessButton.append(languagelessButtonLabel);
                languagelessButtonLabel.classList.add("contexify_itemContent");
                languagelessButtonLabel.textContent = "Copy Language-Agnostic URL";

                languagelessButton.addEventListener("click", () => {
                    const element = Array.from(document.querySelectorAll("li.context-menu")).find(e => e.id.startsWith("phrase_"));
                    if (element) {
                        const id = parseInt(element.id.replace("phrase_", ""))
                        // @ts-ignore
                        crowdin.clipboard.copy(crowdin.helpers.translation.getStringUrl(id, true))
                    }
                })

                const slackButton = document.createElement("div");
                slackButton.classList.add("contexify_item");
                slackButton.tabIndex = -1;
                slackButton.ariaDisabled = "false";
                slackButton.role = "menuitem";

                const slackButtonLabel = document.createElement("div");
                slackButton.append(slackButtonLabel);
                slackButtonLabel.classList.add("contexify_itemContent");
                slackButtonLabel.textContent = "Copy Formatted URL for Slack";

                slackButton.addEventListener("click", () => {
                    const element = Array.from(document.querySelectorAll("li.context-menu")).find(e => e.id.startsWith("phrase_"));
                    if (element) {
                        const id = parseInt(element.id.replace("phrase_", ""))
                        // @ts-ignore
                        void navigator.clipboard.write(formatStringUrlToSlack(crowdin.helpers.translation.getStringUrl(id, true)));
                    }
                })

                button.after(languagelessButton, slackButton);

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