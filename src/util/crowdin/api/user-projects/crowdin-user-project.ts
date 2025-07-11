import {TargetLanguage} from "../../../../apis/crowdin/init/target-language";

export class CrowdinUserProject {
    id: number;
    identifier: string;
    name: string;
    target_languages: TargetLanguage[];
}