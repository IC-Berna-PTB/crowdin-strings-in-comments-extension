import {injectExtensionScript, listenToExtensionMessage} from "../../util/util";
import {ExtensionSettings} from "../../common/extension-settings";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {requestSettings} from "../../common/extension-settings-client";

injectExtensionScript('prevent-pre-filter-inject.js');

const postSettingsInterval = setInterval(settingsInterval, 500)

function settingsInterval() {
    requestSettings().then(settings => postMessage({identifier: ExtensionMessageId.SETTINGS_RETRIEVED, message: settings} as ExtensionMessage<ExtensionSettings>))
}

listenToExtensionMessage(ExtensionMessageId.SETTINGS_ACK, () => clearInterval(postSettingsInterval));
