import {observeElementEvenIfNotReady} from "../../util/util";


function preventCopyTooltip() {
    let tooltipContent: HTMLDivElement = document.querySelector("div.TooltipContent");
    if (tooltipContent) {
        let shortcutInfo: HTMLDivElement = tooltipContent.querySelector("div.shortcut-info");
        if (shortcutInfo && shortcutInfo.innerText.trim() === "Click to copy") {
            tooltipContent.hidden = true;
        }
    }
}

observeElementEvenIfNotReady(".string-key-container--text", (e, disconnect) => {
    if (e.style.cursor !== "pointer") {
        return;
    }
    console.log(e);
    disconnect();
    e.style.cursor = "text";
    e.addEventListener("click", e => e.stopPropagation());
    e.addEventListener("mouseenter", preventCopyTooltip);
    e.addEventListener("focus", e => e.stopPropagation());
    e.addEventListener("mousemove", preventCopyTooltip);
    e.style.marginTop = "auto";
    e.style.marginBottom = "auto";

    const keyIcon: HTMLElement = document.querySelector(".string-key-container--icon");
    keyIcon.style.marginTop = "auto";
    keyIcon.style.marginBottom = "auto";
    keyIcon.style.marginLeft = "4px";
    keyIcon.style.marginRight = "4px";

    const copyButton = document.createElement("button");
    copyButton.classList.add(..."btn btn-icon".split(" "));

    const copyButtonIcon = document.createElement("i");
    copyButtonIcon.title = "Click to copy key to clipboard";
    copyButtonIcon.classList.add("static-icon-csic-copy");

    copyButton.appendChild(copyButtonIcon);
    copyButton.addEventListener("click", () => navigator.clipboard.writeText(e.textContent));

    e.after(copyButton);
}, true)