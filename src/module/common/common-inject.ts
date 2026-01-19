import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {CrowdinInitResponse} from "../../apis/crowdin/init/crowdin-init-response";
import {listenToExtensionMessage, postExtensionMessage} from "../../util/util";
import {getCurrentLanguageId} from "../../apis/crowdin/crowdin-aux-functions";

let init: CrowdinInitResponse | undefined = undefined;

let currentLanguage = -1;

$(document).ajaxSuccess((e:  JQuery.TriggeredEvent, xhr: JQuery.jqXHR, options: JQuery.AjaxSettings, data: JQuery.PlainObject) => {
    if (options.url.startsWith("/backend/editor/init")){
        const response = data as CrowdinInitResponse;
        init = response;
        window.postMessage({
            identifier: ExtensionMessageId.CROWDIN_INIT,
            message: response
        } as ExtensionMessage<CrowdinInitResponse>);
    }
});

// @ts-ignore
window.navigation.addEventListener("navigate", () => {
    getCurrentLanguageId()
        .then(newLanguageId => {
            if (newLanguageId !== currentLanguage) {
                if (currentLanguage !== -1) {
                    postExtensionMessage<number>(ExtensionMessageId.EDITOR_LANGUAGE_CHANGED, newLanguageId);
                }
                currentLanguage = newLanguageId;
            }
        })
})

listenToExtensionMessage<string>(ExtensionMessageId.NOTIFICATION_NOTICE, m => {
    // @ts-ignore
    $.jGrowl(m, {theme: "jGrowl-notice"});
});

listenToExtensionMessage<string>(ExtensionMessageId.NOTIFICATION_SUCCESS, m => {
    // @ts-ignore
    $.jGrowl(m, {theme: "jGrowl-success"});
})

listenToExtensionMessage<string>(ExtensionMessageId.NOTIFICATION_ERROR, m => {
    // @ts-ignore
    $.jGrowl(m, {theme: "jGrowl-error"});
})

