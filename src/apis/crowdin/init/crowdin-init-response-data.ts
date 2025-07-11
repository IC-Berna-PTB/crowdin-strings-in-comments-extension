import {CrowdinInitResponseInitEditor} from "./crowdin-init-response-init-editor";
import {CrowdinAuthResponse} from "./crowdin-auth-response";

export class CrowdinInitResponseData {
    init_editor!: CrowdinInitResponseInitEditor;
    auth!: CrowdinAuthResponse;
}