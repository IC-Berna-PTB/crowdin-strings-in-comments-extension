export class ExtensionMessage<T> {
    identifier: ExtensionMessageId;
    message: T;

    static eventHasId(e: MessageEvent<any>, id: ExtensionMessageId): boolean {
        return e.data instanceof ExtensionMessage && e.data.identifier === id;
    }
}

export enum ExtensionMessageId {
    CROWDIN_INIT = "csic-language-id",
    NOTIFICATION_SUCCESS = "csic-notification-success",
    SETTINGS_DIALOG_OPENED = "csic-settings-dialog-opened",
    REPLACE_TEXT_IN_CARET = "csic-replace-text-in-caret",
    SETTINGS_CLICK_BEHAVIOR_CHANGED = "csic-settings-click-behavior-changed",
    SETTINGS_PREVENT_PRE_FILTERS_CHANGED = "csic-settings-prevent-pre-filters-changed",
    SETTINGS_RETRIEVED = "csic-settings-retrieved",
    SETTINGS_ACK = "csic-settings-ack"
}
