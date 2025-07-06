import {injectExtensionScript} from "../../util/util";
import {ExtensionSettings, getSettings} from "../../common/settings/extension-settings";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";

injectExtensionScript('pcfaftuwf-inject.js');

const postSettingsInterval = setInterval(settingsInterval, 500)

function settingsInterval() {
    getSettings().then(settings => postMessage({identifier: ExtensionMessageId.SETTINGS_RETRIEVED, message: settings} as ExtensionMessage<ExtensionSettings>))
}


window.addEventListener('message', (e: MessageEvent<ExtensionMessage<number>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_ACK) {
        clearInterval(postSettingsInterval);
    }
})

