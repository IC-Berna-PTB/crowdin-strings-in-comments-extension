import {CrowdinInitResponse} from "../../apis/crowdin/init/crowdin-init-response";
import {ExtensionMessage, ExtensionMessageId} from "./aux-objects/extension-message";
import {CrowdinPhrasesResponse} from "../../apis/crowdin/multiple-phrases/crowdin-phrases-response";

const updateStringUrlInterval = setInterval(() => {
    //@ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation) {
        clearInterval(updateStringUrlInterval);
        //@ts-ignore
        const originalGetStringUrl = window.crowdin.helpers.translation.getStringUrl;


        //@ts-ignore
        window.crowdin.helpers.translation.getStringUrl = (id: number): string => {
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
            return url.toString();
        }
        clearInterval(updateStringUrlInterval);
    } else {
    }
}, 500);

let phrases: CrowdinPhrasesResponse = null;

$(document).ajaxSuccess((_e:  JQuery.TriggeredEvent, _xhr: JQuery.jqXHR, options: JQuery.AjaxSettings, data: JQuery.PlainObject) => {
    if (options.url === ("/backend/phrases") && options.method === "POST") {
        phrases = data as CrowdinPhrasesResponse;
    }
});

let init: CrowdinInitResponse = null;

$(document).ajaxSuccess((e:  JQuery.TriggeredEvent, xhr: JQuery.jqXHR, options: JQuery.AjaxSettings, data: JQuery.PlainObject) => {
    if (options.url.startsWith("/backend/editor/init")){
        const response = data as CrowdinInitResponse;
        init = response;
        window.postMessage({
            identifier: ExtensionMessageId.LANGUAGE_ID,
            message: response
        } as ExtensionMessage<CrowdinInitResponse>);
    }
});

window.addEventListener("message", e => {
    if (e.data.identifier === ExtensionMessageId.NOTIFICATION_SUCCESS){
        // @ts-ignore
        $.jGrowl(e.data.message, {theme: "jGrowl-success"})
    }
})
