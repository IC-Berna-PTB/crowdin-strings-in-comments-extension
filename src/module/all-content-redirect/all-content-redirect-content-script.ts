import {injectExtensionScript, listenToExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {CrowdinInitResponse} from "../../apis/crowdin/init/crowdin-init-response";

// injectExtensionScript("all-content-redirect/all-content-redirect-inject.js");

listenToExtensionMessage(ExtensionMessageId.CROWDIN_INIT, whenInitRetrieved);

function whenInitRetrieved(init: CrowdinInitResponse) {
    const pathSplit = window.location.pathname.split("/");
    if (pathSplit.length <= 5) {
        return;
    }
    if (init.data.init_editor.has_access_in_out_of_workflow) {
        pathSplit.pop()
        window.location.pathname = pathSplit.join("/")
    }


}