import {requestSettings} from "../../common/extension-settings-client";

async function waitForUnlock(target_language_id: number, suggestion_id: number): Promise<void> {
    const object = [
        "approve",
        // @ts-ignore
        crowdin.editor.project.id,
        target_language_id,
        suggestion_id.toString(),
    ]
    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            // @ts-ignore
            if (!crowdin.ajax.isLocked(object)) {
                clearInterval(interval);
                resolve();
            }
        }, 100)
    })
}

const interval = setInterval(() => {
    // @ts-ignore
    if (window.crowdin.suggestions.approve_suggestion) {
        clearInterval(interval);
        // @ts-ignore
        const suggestions = window.crowdin.suggestions;
        const original = suggestions.approve_suggestion;
        suggestions.approve_suggestion = async function(suggestion_id: number, t: unknown) {
            const originalArguments = arguments;
            // @ts-ignore
            const translationId: number = suggestions.get_suggestion(suggestion_id, null, t).translation_id;
            if (!!(await requestSettings()).highlanderApproval) {
                for (const otherSuggestion of suggestions.get_suggestions(translationId)
                    .filter((sug: any) => sug.id !== Number(suggestion_id))) {
                    for (const val of otherSuggestion.validations) {
                        // @ts-ignore
                        suggestions.disapprove_suggestion(otherSuggestion.id, crowdin.editor.target_language.id, val.approved_by, !1, null);
                        // @ts-ignore
                        await waitForUnlock(crowdin.editor.target_language.id, otherSuggestion.id);

                    }
                }
            }
            original.apply(suggestions, originalArguments);
        }
    }
}, 500)


// // @ts-ignore
// $(document).ajaxSend(async (_e: JQuery.TriggeredEvent, _xhr: JQuery.jqXHR, options: JQuery.AjaxSettings) => {
//         const url = new URL(options.url, window.location.origin);
//         if (url.pathname.startsWith("/backend/suggestions/approve") &&
//             url.searchParams.get("suggestion_action") === "approve" &&
//             !!(await requestSettings()).highlanderApproval
//         ){
//             const params = new URLSearchParams(options.data);
//             const translationId = Number(params.get("translation_id"));
//             // @ts-ignore
//             window.crowdin.suggestions.disapprove_multiple([translationId], true)
//         }
// })