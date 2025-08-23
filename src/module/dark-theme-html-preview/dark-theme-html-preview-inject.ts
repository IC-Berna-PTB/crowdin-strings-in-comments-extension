import {postExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";

const sourceFileLoadedInterval = setInterval(() => {
    // @ts-ignore
    if (!window.crowdin || !window.crowdin.phrases || !crowdin.phrases.source_file_loaded) {
        return;
    }
    clearInterval(sourceFileLoadedInterval);
    // @ts-ignore
    const originalFunction = window.crowdin.phrases.source_file_loaded;

    // @ts-ignore
    window.crowdin.phrases.source_file_loaded = () => {
        // @ts-ignore
        originalFunction.apply(window.crowdin.phrases);
        postExtensionMessage<unknown>(ExtensionMessageId.HTML_PREVIEW_UPDATED, {});
    };

}, 500)