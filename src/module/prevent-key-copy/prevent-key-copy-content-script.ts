import {injectExtensionScript, observeElementEvenIfNotReady, postExtensionMessage} from "../../util/util";
import {ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";


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
    disconnect();
    e.style.marginTop = "auto";
    e.style.marginBottom = "auto";

    const keyIcon: HTMLElement = document.querySelector(".string-key-container--icon");
    keyIcon.style.marginTop = "auto";
    keyIcon.style.marginBottom = "auto";
    keyIcon.style.marginLeft = "4px";
    keyIcon.style.marginRight = "4px";

    const copyLinkButton = document.createElement("button");
    copyLinkButton.classList.add(..."btn btn-icon".split(" "));

    const copyLinkButtonIcon = document.createElement("i");
    copyLinkButtonIcon.title = "Click to copy link to string";
    copyLinkButtonIcon.classList.add("static-icon-csic-copy-link");

    copyLinkButton.appendChild(copyLinkButtonIcon);
    copyLinkButton.addEventListener("click", () => postExtensionMessage(ExtensionMessageId.COPY_URL_TO_CLIPBOARD, null));

    e.after(copyLinkButton);

    if (e.style.cursor === "pointer") {
        e.style.cursor = "text";
        e.addEventListener("click", e => e.stopPropagation());
        e.addEventListener("mouseenter", preventCopyTooltip);
        e.addEventListener("focus", e => e.stopPropagation());
        e.addEventListener("mousemove", preventCopyTooltip);

        const copyKey = document.createElement("button");
        copyKey.classList.add(..."btn btn-icon".split(" "));

        const copyKeyButtonIcon = document.createElement("i");
        copyKeyButtonIcon.title = "Click to copy key to clipboard";
        copyKeyButtonIcon.classList.add("static-icon-csic-copy");

        copyKey.appendChild(copyKeyButtonIcon);
        copyKey.addEventListener("click", () => navigator.clipboard.writeText(e.textContent));

        const copyLinkSlackButton = document.createElement("button");
        copyLinkSlackButton.classList.add(..."btn btn-icon".split(" "));

        const copyLinkSlackButtonIcon = document.createElement("i");
        copyLinkSlackButtonIcon.title = "Click to copy Slack-formatted URL";
        copyLinkSlackButtonIcon.classList.add("static-icon-csic-copy-link-slack");

        copyLinkSlackButton.appendChild(copyLinkSlackButtonIcon);
        copyLinkSlackButton.addEventListener("click", () => postExtensionMessage(ExtensionMessageId.COPY_SLACK_FORMATTED_URL_TO_CLIPBOARD, null));

        e.after(copyKey, copyLinkSlackButton);
    }


}, true)

injectExtensionScript('prevent-key-copy-inject.js');
