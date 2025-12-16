import {requestSettings} from "../../common/extension-settings-client";

const interval = setInterval(() => {
    // @ts-ignore
    if (window.crowdin.suggestions.approve_suggestion) {
        clearInterval(interval);
        // @ts-ignore
        const suggestions = window.crowdin.suggestions;
        const original = suggestions.approve_suggestion;
        suggestions.approve_suggestion = async function(e: unknown, t: unknown) {
            const originalArguments = arguments;
            // @ts-ignore
            const translationId: number = suggestions.get_suggestion(e, null, t).translation_id;
            if (!!(await requestSettings()).highlanderApproval) {
                const postDisapprove = function(_e: JQuery.TriggeredEvent, _xhr: JQuery.jqXHR, options: JQuery.AjaxSettings) {
                    const url = new URL(options.url, window.location.origin);
                    const data = new URLSearchParams(options.data);
                    if (url.pathname.startsWith("/backend/suggestions/disapprove_multiple") &&
                        data.has("translation_id[]") &&
                        Number(data.get("translation_id[]")) === translationId) {
                        $(document).off('ajaxSuccess', postDisapprove);
                        original.apply(suggestions, originalArguments);
                    }
                }
                $(document).on('ajaxSuccess', postDisapprove);
                await suggestions.disapprove_multiple([translationId], true);
            }
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