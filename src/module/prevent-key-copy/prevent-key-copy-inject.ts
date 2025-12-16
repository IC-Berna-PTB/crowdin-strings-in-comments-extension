import {listenToExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {formatStringUrlToSlack} from "../../util/format-string-url-to-slack";

listenToExtensionMessage<void>(ExtensionMessageId.COPY_URL_TO_CLIPBOARD, () => {
    //@ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation) {
        //@ts-ignore
        void navigator.clipboard.writeText(window.crowdin.helpers.translation.getStringUrl(null, true));
    }
});

listenToExtensionMessage<void>(ExtensionMessageId.COPY_SLACK_FORMATTED_URL_TO_CLIPBOARD, () => {
    //@ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation) {
        //@ts-ignore
        void navigator.clipboard.write(formatStringUrlToSlack(window.crowdin.helpers.translation.getStringUrl(null, true)));
    }

})