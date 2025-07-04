import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";

window.addEventListener("message", (e: MessageEvent<ExtensionMessage<string>>) => {
    if (e.data.identifier === ExtensionMessageId.SETTINGS_DIALOG_OPENED){
        let targetElement = $(e.data.message);
        // @ts-ignore
        targetElement.draggable();
        // @ts-ignore
        targetElement.position({of: document});
    }
})
