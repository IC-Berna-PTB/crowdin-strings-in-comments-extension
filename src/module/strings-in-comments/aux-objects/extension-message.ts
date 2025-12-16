export class ExtensionMessage<T> {
    identifier: ExtensionMessageId;
    message: T;

    static eventHasId(e: MessageEvent<any>, id: ExtensionMessageId): boolean {
        return e.data instanceof ExtensionMessage && e.data.identifier === id;
    }
}

export enum ExtensionMessageId {
    CROWDIN_INIT = "csic-language-id",
    COPY_URL_TO_CLIPBOARD = "csic-copy-url-to-clipboard",
    COPY_SLACK_FORMATTED_URL_TO_CLIPBOARD = "csic-copy-slack-formatted-url-to-clipboard",
    SET_SEARCH_FIELD_VALUE = "csic-set-search-field-value",
    NOTIFICATION_SUCCESS = "csic-notification-success",
    NOTIFICATION_NOTICE = "csic-notification-notice",
    NOTIFICATION_ERROR = "csic-notification-error",
    NOTIFICATION_NON_DEFAULT_LANGUAGE = "csic-notification-non-default-language",
    HTML_PREVIEW_UPDATED = "csic-html-preview-updated",
    SETTINGS_DIALOG_OPENED = "csic-settings-dialog-opened",
    SETTINGS_IMPORT_REQUESTED = "csic-settings-import-requested",
    SETTINGS_IMPORT_SUCCESSFUL = "csic-settings-import-successful",
    SETTINGS_IMPORT_FAILED = "csic-settings-import-failed",
    SETTINGS_EXPORT_REQUESTED = "csic-settings-export-requested",
    SETTINGS_EXPORT_SUCCESSFUL = "csic-settings-export-successful",
    REPLACE_TEXT_IN_CARET = "csic-replace-text-in-caret",
    SETTINGS_CLICK_BEHAVIOR_CHANGED = "csic-settings-click-behavior-changed",
    SETTINGS_PREVENT_PRE_FILTERS_CHANGED = "csic-settings-prevent-pre-filters-changed",
    SETTINGS_NAGGED_ABOUT_DEFAULT_LANGUAGE = "csic-nagged-about-default-language",
    SETTINGS_DOMAIN_DEFAULT_LANGUAGE_CHANGED = "csic-settings-domain-default-language-changed",
    SETTINGS_DOMAIN_DEFAULT_LANGUAGE_SET_BY_NOTIFICATION = "csic-settings-domain-default-language-set-by-notification",
    SETTINGS_PROJECT_DEFAULT_LANGUAGE_CHANGED = "csic-settings-project-default-language-changed",
    SETTINGS_DARK_THEME_HTML_PREVIEW_CHANGED = "csic-settings-dark-theme-html-preview-changed",
    SETTINGS_ALL_CONTENT_REDIRECT_CHANGED = "csic-settings-all-content-redirect-changed",
    SETTINGS_HIGHLANDER_APPROVAL_CHANGED = "csic-settings-highlander-approval-changed",
    SETTINGS_REQUESTED_BY_MODULE = "csic-settings-requested-by-module",
    SETTINGS_RETRIEVED = "csic-settings-retrieved",
    SETTINGS_ACK = "csic-settings-ack",
}
