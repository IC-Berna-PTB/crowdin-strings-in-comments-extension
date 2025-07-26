import {ExtensionMessage, ExtensionMessageId} from "../module/strings-in-comments/aux-objects/extension-message";
import {CrowdinInitResponse} from "../apis/crowdin/init/crowdin-init-response";
import {listenToExtensionMessage} from "../util/util";

let init: CrowdinInitResponse | undefined = undefined;

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

