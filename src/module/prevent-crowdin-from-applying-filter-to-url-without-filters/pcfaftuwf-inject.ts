import {CrowdinSearchQueryType} from "../../util/crowdin/crowdin-search-parameters";
import {ExtensionSettings} from "../../common/settings/extension-settings";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";


console.log("oi")
const originalSearchParameters = new URLSearchParams(window.location.search);
console.log(originalSearchParameters);
let settings: ExtensionSettings | undefined = undefined;

window.addEventListener("message", (e: MessageEvent<ExtensionMessage<ExtensionSettings>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_RETRIEVED) {
        settings = e.data.message;
        postMessage({identifier: ExtensionMessageId.SETTINGS_ACK, message: 0} as ExtensionMessage<number>)
    }
});

const interval = setInterval(() => {
    // @ts-ignore
    if (!document.querySelector("#master-loader") && settings) {
        if (settings.preventPreFilter) {
            const currentSearchParameters = new URLSearchParams(window.location.search);
            if (originalSearchParameters.get("value") !== currentSearchParameters.get("value")) {
                // @ts-ignore
                crowdin.phrases.sort_order(originalSearchParameters.get("value") ?? CrowdinSearchQueryType.SHOW_ALL);
            }
        }
        console.log(interval);
        clearInterval(interval);
    } else {
        console.log(new URLSearchParams(window.location.search))
    }
}, 500)

// let listener = (event: MessageEvent<ExtensionMessage<CrowdinInitResponse>> )=> {
//     if (event.data.identifier === ExtensionMessageId.CROWDIN_INIT) {
//         const currentSearchParameters = new URLSearchParams(window.location.search);
//         if (originalSearchParameters.get("value") !== currentSearchParameters.get("value")) {
//             // @ts-ignore
//             crowdin.phrases.sort_order(originalSearchParameters.get("value") ?? CrowdinSearchQueryType.SHOW_ALL);
//         }
//     window.removeEventListener("message", listener);
//     }
// };
//
//
// window.addEventListener("message", listener)