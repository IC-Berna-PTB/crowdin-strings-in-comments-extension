import {CrowdinSearchQueryType} from "../../util/crowdin/crowdin-search-parameters";
import {ExtensionSettings} from "../../common/settings/extension-settings";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";


const originalSearchParameters = new URLSearchParams(window.location.search);
let settings: ExtensionSettings | undefined = undefined;

window.addEventListener("message", (e: MessageEvent<ExtensionMessage<ExtensionSettings>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_RETRIEVED) {
        settings = e.data.message;
        postMessage({identifier: ExtensionMessageId.SETTINGS_ACK, message: 0} as ExtensionMessage<number>)
    }
});

const interval = setInterval(() => {
    // @ts-ignore
    if (!document.querySelector("#master-loader") && settings && hasTargetLanguage()) {
        if (settings.preventPreFilter) {
            const currentSearchParameters = new URLSearchParams(window.location.search);
            if (originalSearchParameters.get("value") !== currentSearchParameters.get("value")) {
                // @ts-ignore
                crowdin.phrases.sort_order(originalSearchParameters.get("value") ?? CrowdinSearchQueryType.SHOW_ALL);
            }
        }
        clearInterval(interval);
    }
}, 500)

function hasTargetLanguage() {
    // @ts-ignore
    return crowdin.editor.target_language || crowdin.editor.target_language.length > 0
}