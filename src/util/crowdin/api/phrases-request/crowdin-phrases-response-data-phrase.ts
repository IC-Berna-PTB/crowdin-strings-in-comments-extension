import {CrowdinPhraseResponseTranslationStatus} from "../phrase-response/crowdin-phrase-response-translation-status";
import {CrowdinPhraseResponseData} from "../phrase-response/crowdin-phrase-response-data";
import {CrowdinPhraseResponseTranslation} from "../phrase-response/crowdin-phrase-response-translation";

export class CrowdinPhrasesResponseDataPhrase {
    id!: number;
    key?: string;
    text!: string;
    translation_status!: CrowdinPhraseResponseTranslationStatus;
    file_path?: string;
    top_suggestion_text!: string;

    convertToPhraseResponseData(): CrowdinPhraseResponseData {
        const translation = new CrowdinPhraseResponseTranslation();
        translation.text = this.text;
        translation.key = this.key;
        translation.file_path = this.file_path;

        const data = new CrowdinPhraseResponseData();
        data.success = true;
        data.translation = translation;
        data.top_suggestion = this.top_suggestion_text;
        data.translation_status = this.translation_status;

        return data;
    }
}
