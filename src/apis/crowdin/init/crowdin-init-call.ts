import {getCurrentProjectId} from "../crowdin-main";
import {CrowdinInitResponse} from "./crowdin-init-response";
import {getFetchParams} from "../../../util/getFetchParams";

/**
 * Makes a call to the internal `/backend/editor/init` GET method of the current Crowdin instance,
 * using the {@link languagePair} as the base.
 * @param languagePair the language pair of the current editor.
 */
export async function getInit(languagePair: string) {
    const r = await fetch(`${window.location.origin}/backend/editor/init?editor_mode=translate&project_id=${getCurrentProjectId()}&file_id=all&languages=${languagePair}`, getFetchParams());
    const r_1 = await r.text();
    return JSON.parse(r_1) as CrowdinInitResponse;
}
