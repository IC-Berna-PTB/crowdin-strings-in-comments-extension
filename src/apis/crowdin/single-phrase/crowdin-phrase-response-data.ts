import {CrowdinTranslationStatus} from "../../../util/crowdin/api/common/crowdin-translation-status";
import {CrowdinPhraseResponseTranslation} from "./crowdin-phrase-response-translation";

export class CrowdinPhraseResponseData {
    success!: boolean;
    translation!: CrowdinPhraseResponseTranslation;
    top_suggestion!: string;
    translation_status!: CrowdinTranslationStatus;
}
