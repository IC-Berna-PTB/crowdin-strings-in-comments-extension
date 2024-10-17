import {CrowdinPhraseResponseTranslationStatus} from "./crowdin-phrase-response-translation-status";

export class CrowdinPhraseResponseData {
    success!: boolean;
    top_suggestion!: string;
    translation_status!: CrowdinPhraseResponseTranslationStatus;
}