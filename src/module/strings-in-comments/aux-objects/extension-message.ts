export class ExtensionMessage<T> {
    identifier: ExtensionMessageId;
    message: T;
}

export enum ExtensionMessageId {
    LANGUAGE_ID = "csic-language-id",
    NOTIFICATION_SUCCESS = "csic-notification-success",
    SETTINGS_DIALOG_OPENED = "csic-settings-dialog-opened",
    REPLACE_TEXT_IN_CARET = "csic-replace-text-in-caret",
    SETTINGS_CLICK_BEHAVIOR_CHANGED = "csic-settings-click-behavior-changed"
}
