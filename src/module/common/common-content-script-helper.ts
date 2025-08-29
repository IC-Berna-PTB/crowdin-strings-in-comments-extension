import {listenToExtensionMessage} from "../../util/util";
import {CrowdinInitResponse} from "../../apis/crowdin/init/crowdin-init-response";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {getCurrentLanguagePair} from "../../util/getFetchParams";
import {getInit} from "../../apis/crowdin/init/crowdin-init-call";

export class CommonContentScriptHelper {
    private static currentInit: CrowdinInitResponse | undefined = undefined;

    static {
        listenToExtensionMessage<CrowdinInitResponse>(ExtensionMessageId.CROWDIN_INIT, m => this.currentInit = m);
    }

    static async getCurrentInit(): Promise<CrowdinInitResponse> {
        if (!CommonContentScriptHelper.currentInit) {
            await getInit(getCurrentLanguagePair())
                .then(r => this.currentInit = r);
        }
        return this.currentInit;
    }

}