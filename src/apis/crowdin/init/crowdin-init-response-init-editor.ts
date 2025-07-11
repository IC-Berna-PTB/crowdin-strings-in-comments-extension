import {TargetLanguage} from "./target-language";
import {CrowdinUserProject} from "../../../util/crowdin/api/user-projects/crowdin-user-project";

export class CrowdinInitResponseInitEditor {
    target_language?: TargetLanguage;
    out_of_scope_target_lang?: TargetLanguage;
    project?: CrowdinUserProject;
}