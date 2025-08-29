import {listenToExtensionMessage, objectToBase64, postExtensionMessage} from "../util/util";
import {ExtensionMessageId} from "../module/strings-in-comments/aux-objects/extension-message";
import {ExtensionSettings} from "./extension-settings";

export let extensionSettings: ExtensionSettings | undefined = undefined;

export async function requestSettings(): Promise<ExtensionSettings> {
    if (extensionSettings !== undefined) {
        return extensionSettings;
    }
    postExtensionMessage<unknown>(ExtensionMessageId.SETTINGS_REQUESTED_BY_MODULE, null)
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (extensionSettings !== undefined) {
                clearInterval(interval);
                resolve(extensionSettings);
            }
        }, 100)
    })
}

export async function exportSettings(): Promise<string> {
    return await requestSettings().then(s => objectToBase64(s));
}

export async function requestSettingsImport(text: string): Promise<boolean> {
    postExtensionMessage(ExtensionMessageId.SETTINGS_IMPORT_REQUESTED, text);
    return new Promise(resolve => {
        listenToExtensionMessage<boolean>(
            ExtensionMessageId.SETTINGS_IMPORT_SUCCESSFUL,
            (result) => resolve(result)
        );
    })

}

listenToExtensionMessage<ExtensionSettings>(ExtensionMessageId.SETTINGS_RETRIEVED , es => extensionSettings = es)