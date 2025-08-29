import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {listenToExtensionMessage} from "../../util/util";


listenToExtensionMessage<string>(ExtensionMessageId.SETTINGS_DIALOG_OPENED, m => {
    let targetElement = $(m);
    // @ts-ignore
    targetElement.draggable();
    // @ts-ignore
    targetElement.position({of: document});
})
