import {listenToExtensionMessage} from "../../util/util";
import {ExtensionSettings} from "../../common/settings/extension-settings";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {CrowdinInitResponse} from "../../apis/crowdin/init/crowdin-init-response";
import {getDefaultLanguageForDomainInSettings} from "./default-language-helper";

let settings: ExtensionSettings | undefined = undefined;
let init: CrowdinInitResponse | undefined = undefined;

listenToExtensionMessage<ExtensionSettings>(ExtensionMessageId.SETTINGS_RETRIEVED, m => {
    settings = m;
    postMessage({identifier: ExtensionMessageId.SETTINGS_ACK, message: 0} as ExtensionMessage<number>);
});

listenToExtensionMessage<CrowdinInitResponse>(ExtensionMessageId.CROWDIN_INIT, m => {
    init = m;
});


const interval = setInterval(() => {
    // @ts-ignore
    if (!document.querySelector("#master-loader") && settings) {
        const defaultLanguage = getDefaultLanguageForDomainInSettings(settings, init.data.auth.domain);
        // @ts-ignore
        const currentLanguage = crowdin?.editor?.target_language?.id ?? null;
        if (hasTargetLanguage() && currentLanguage !== defaultLanguage) {
            setTimeout(() => showNonDefaultLanguageMessage(currentLanguage, defaultLanguage), 2000);
        } else {
            // @ts-ignore
            crowdin.editor.updateLanguage(defaultLanguage, true);
            postMessage({identifier: ExtensionMessageId.NOTIFICATION_SUCCESS, message: "Redirected URL without language to your default"} as ExtensionMessage<string>)
        }
        clearInterval(interval);
    }
}, 500)

function showNonDefaultLanguageMessage(currentLanguage: number, defaultLanguage: number) {
    const currentName = getDescriptionForLanguageId(currentLanguage);
    const defaultName = getDescriptionForLanguageId(defaultLanguage);
    // @ts-ignore
    $.jGrowl(`
<p class="notification-body">The link you opened is for <b>${currentName}</b>, but your default language is <b>${defaultName}</b>.</p>
<p class="notification-body">Want to change to <b>${defaultName}</b>?</p>
<div class="notification-actions clearfix ">
    <div class="pull-left btn-toolbar no-margin">
        <button onclick="crowdin.editor.updateLanguage(${defaultLanguage}, true)" class="btn btn-small csic-change-notification">
        🔁 Change
        </button>
        <button class="btn btn-small cancel-notification">
        ❌ Keep 
        </button>
    </div>
</div>
`, {theme: "jGrowl-notice", sticky: true});
}

function getDescriptionForLanguageId(id: number): string {
    return init?.data?.init_editor?.project?.target_languages?.find(l => parseInt(l.id) === id)?.name ?? `Language ID ${id}`;
}

function hasTargetLanguage() {
    // @ts-ignore
    return crowdin.editor.target_language || (crowdin?.editor?.target_language?.length ?? 0) > 0
}