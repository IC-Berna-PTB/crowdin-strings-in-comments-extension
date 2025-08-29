import {injectExtensionScript, listenToExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {requestSettings} from "../../common/extension-settings-client";

injectExtensionScript("dark-theme-html-preview-inject.js");

listenToExtensionMessage<unknown>(ExtensionMessageId.HTML_PREVIEW_UPDATED, whenHtmlPreviewUpdated)
async function whenHtmlPreviewUpdated() {
    if (!(await requestSettings()).darkThemeHtml) {
        return;
    }
    const iFrame = document.querySelector("iframe#html_frame");
    if (!iFrame || !(iFrame instanceof HTMLIFrameElement)) {
        return;
    }
    const iFrameDoc = iFrame.contentDocument;
    if (!iFrameDoc) {
        return;
    }
    iFrame.contentDocument.body.classList.add("txt");
}