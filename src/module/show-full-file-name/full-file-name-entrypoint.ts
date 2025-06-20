import {elementReady} from "../../util/util";

function reloadFileName(element: HTMLElement) {
    let actualElement: HTMLAnchorElement = element.querySelector(".current-file-name > a")
    if (actualElement && actualElement.dataset.csicOldHref != actualElement.href) {
        actualElement.text = actualElement.title.replace("Translate file: ", "");
        actualElement.dataset.csicOldHref = actualElement.href;
    }
}

elementReady("#source_context_wrapper").then((element: HTMLElement) => {
    reloadFileName(element);
    new MutationObserver(() => {
        reloadFileName(element);
    }).observe(element, {childList: true, subtree: true});
})
