export class ExtensionMessage<T> {
    identifier: ExtensionMessageId;
    message: T;
}

export enum ExtensionMessageId {
    LANGUAGE_ID = "csic-language-id",
    NOTIFICATION_SUCCESS = "csic-notification-success",
}
