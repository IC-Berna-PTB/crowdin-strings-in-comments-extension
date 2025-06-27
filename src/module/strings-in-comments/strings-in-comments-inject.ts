const updateStringUrlInterval = setInterval(() => {
    //@ts-ignore
    if (window.crowdin && window.crowdin.helpers && window.crowdin.helpers.translation) {
        //@ts-ignore
        const originalGetStringUrl = window.crowdin.helpers.translation.getStringUrl;
        //@ts-ignore
        window.crowdin.helpers.translation.getStringUrl = (): string => {
            //@ts-ignore
            const url = new URL(originalGetStringUrl.apply(window.crowdin.helpers.translation));
            const keyText: HTMLElement = document.querySelector("#source_context_container > div.string-key-container--wrapper > div.string-key-container--text");
            if (keyText.dataset.state !== undefined) {
                url.searchParams.append("csic-key", keyText.textContent)
            }
            return url.toString();
        }
        clearInterval(updateStringUrlInterval);
    } else {
    }
}, 500);

//@ts-ignore
$(document).ajaxSuccess((e:  JQuery.TriggeredEvent, xhr: JQuery.jqXHR, options: JQuery.AjaxSettings, data: JQuery.PlainObject) => {
    if (options.url.startsWith("/backend/phrases")){
        console.log(data);
    }
});