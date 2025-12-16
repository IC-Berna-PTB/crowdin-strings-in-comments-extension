import {
    injectExtensionScript,
    listenToExtensionMessage,
    observeElementEvenIfNotReady,
    postExtensionMessage
} from "../../util/util";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {BooleanishNumber, ExtensionSettings,} from "../../common/extension-settings";
import {ClickBehaviorOption} from "../strings-in-comments/settings/click-behavior-option";
import {CommonContentScriptHelper} from "../common/common-content-script-helper";
import {
    DomainLanguage,
    getDefaultLanguageForCurrentDomainInSettings,
    getDefaultLanguageForDomain,
    INVALID_LANGUAGE
} from "../default-language/default-language-helper";
import {exportSettings, requestSettings, requestSettingsImport} from "../../common/extension-settings-client";


class SettingParameters {
    id: string
    label: string
    helpText?: string
    setting: (settings: ExtensionSettings) => boolean;
    messageId: ExtensionMessageId;
}

class CommonMenu {

    static INSTANCE = new CommonMenu();

    constructor() {
        observeElementEvenIfNotReady("#progress-widget", (element, disconnect) => {
            disconnect();
            const openMenuButton = CommonMenu.createMenuButtonElement();
            const dialog = CommonMenu.createSettingsDialog();

            let dialogBody = dialog.querySelector("#csic-settings-dialog-body");
            const clickBehavior = CommonMenu.createClickBehaviorSetting();
            dialogBody.appendChild(clickBehavior);

            const preventPreFilter = CommonMenu.createCheckboxSetting({
                id: "csic-setting-prevent-pre-filter",
                label: "Always open URLs without filters in  \"Show All\" mode",
                helpText: "When opening an URL without filter parameters, prevent Crowdin " +
                    "from applying your latest used filter (e.g. CroQL) automatically",
                messageId: ExtensionMessageId.SETTINGS_PREVENT_PRE_FILTERS_CHANGED,
                setting: (settings: ExtensionSettings) => !!settings.preventPreFilter
            });
            dialogBody.appendChild(preventPreFilter);

            const darkThemeHtmlPreview = CommonMenu.createCheckboxSetting({
                id: "csic-setting-dark-theme-html-preview",
                label: "Force HTML preview in dark when using Crowdin in dark mode",
                helpText: "When opening a HTML file, forces it to be in dark mode when Crowdin is also in dark mode",
                messageId: ExtensionMessageId.SETTINGS_DARK_THEME_HTML_PREVIEW_CHANGED,
                setting: (settings: ExtensionSettings) => !!settings.darkThemeHtml
            });
            dialogBody.appendChild(darkThemeHtmlPreview);

            const allContentRedirect = CommonMenu.createCheckboxSetting({
                id: "csic-setting-all-content-redirect",
                label: "Autoredirect to \"All Content\" workflow if available",
                messageId: ExtensionMessageId.SETTINGS_ALL_CONTENT_REDIRECT_CHANGED,
                setting: (es) => !!es.allContentRedirect
            });
            dialogBody.appendChild(allContentRedirect);

            CommonMenu.createDefaultLanguageSetting()
                .then(l => dialogBody.appendChild(l))

            const highlanderApproval = CommonMenu.createCheckboxSetting({
                id: "csic-setting-highlander-approval",
                label: "Highlander Approval mode",
                helpText: "When approving a suggestion, automatically remove all approvals from other suggestions",
                messageId: ExtensionMessageId.SETTINGS_HIGHLANDER_APPROVAL_CHANGED,
                setting: (es) => !!es.highlanderApproval
            });
            dialogBody.appendChild(highlanderApproval);

            const buttonFooter = CommonMenu.createDialogButtonFooterElement();
            dialog.append(buttonFooter);

            document.body.append(dialog);
            // const menu = this.createSettingsMenu();
            // this.test(menu, "Test");

            const openMenuButtonDiv = CommonMenu.createRightSideToolbarContainer();
            openMenuButtonDiv.id = "csic-settings-btn";
            openMenuButtonDiv.title = 'Open "Enhanced Crowdin" extension settings'

            openMenuButtonDiv.append(openMenuButton);
            openMenuButtonDiv.addEventListener("click", () => CommonMenu.toggleDialog(dialog))

            element.after(openMenuButtonDiv);
        })
    }


    private static createRightSideToolbarContainer(): HTMLDivElement {
        const divElement = document.createElement("div");
        divElement.classList.add("pull-right", "clearfix", "btn-group");
        return divElement;
    }

    private static createMenuButtonElement(): HTMLButtonElement {
        const buttonElement = document.createElement("button");
        buttonElement.classList.add("btn", "btn-icon", "dropdown-toggle");
        buttonElement.dataset.state = "closed";
        buttonElement.tabIndex = 1;

        const iconElement = document.createElement("i");
        iconElement.classList.add("static-icon-csic-puzzle-piece");

        buttonElement.append(iconElement);
        return buttonElement;
    }

    private static createSettingsDialog(): HTMLDivElement {
        const dialog = document.createElement("div");
        dialog.id = "csic-settings-dialog";
        dialog.classList.add(..."ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable ui-dialog-buttons".split(" "));
        dialog.role = "dialog";
        dialog.classList.add("csic-dialog-hidden");

        const titleBar = document.createElement("div");
        dialog.append(titleBar);
        titleBar.classList.add(..."ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix".split(" "));

        const title = document.createElement("span");
        titleBar.append(title);
        title.classList.add("ui-dialog-title");
        title.style.width = "auto";
        title.innerText = "Enhanced Crowdin settings";

        const closeButton = document.createElement("a");
        titleBar.append(closeButton);
        closeButton.classList.add(..."ui-dialog-titlebar-close ui-corner-all".split(" "));
        closeButton.href = "#";
        closeButton.role = "button";
        closeButton.addEventListener("click", () => dialog.classList.add("csic-dialog-hidden"));

        const closeIcon = document.createElement("span");
        closeButton.append(closeIcon);
        closeIcon.classList.add(..."ui-icon ui-icon-closethick".split(" "));

        const body = document.createElement("div");
        dialog.append(body);
        body.id = "csic-settings-dialog-body";
        body.classList.add(..."ui-dialog-content ui-widget-content csic-dialog-body".split(" "));

        return dialog;
    }

    private static createCheckboxSetting(settingParameters: SettingParameters) {
        const controlGroup = document.createElement("div");
        controlGroup.classList.add("control-group", "margin-top");

        const label = document.createElement("label");
        controlGroup.append(label);
        label.textContent = settingParameters.label;
        label.classList.add("checkbox");

        const input = document.createElement("input");
        label.append(input);
        input.id = settingParameters.id;
        input.type = "checkbox";
        input.name = settingParameters.id;

        requestSettings().then(s => input.checked = settingParameters.setting(s));

        if (settingParameters.helpText) {
            const helpBlock = this.createHelpBlock(settingParameters.helpText)
            controlGroup.append(helpBlock);
        }

        input.addEventListener("change", () => {
            const enabled = input.checked;
            postExtensionMessage<BooleanishNumber>(settingParameters.messageId, enabled ? 1 : 0);
        })

        listenToExtensionMessage<ExtensionSettings>(ExtensionMessageId.SETTINGS_IMPORT_SUCCESSFUL, es => {
            input.checked = !!settingParameters.setting(es);
        });

        return controlGroup;
    }

    private static toggleDialog(dialog: HTMLDivElement): void {
        dialog.classList.toggle("csic-dialog-hidden");
        if (dialog.checkVisibility()) {
            postMessage({
                identifier: ExtensionMessageId.SETTINGS_DIALOG_OPENED,
                message: `#${dialog.id}`
            } as ExtensionMessage<string>);
        }
    }

    private static createClickBehaviorSetting(): HTMLElement {
        const controlGroup = document.createElement("div");
        controlGroup.classList.add("control-group");
        controlGroup.id = "csic-setting-click-behavior";

        const label = document.createElement("label");
        controlGroup.append(label);
        label.textContent = "Clicking on a translation in a comment...";
        label.htmlFor = "csic-setting-click-behavior-select";

        const select = document.createElement("select");
        controlGroup.append(select);
        select.id = label.htmlFor;
        select.name = select.id;
        select.classList.add("full-width");

        Object.values(ClickBehaviorOption.VALUES)
            .map(async o => {
            const option = document.createElement("option");
            option.value = o.id.toString();
            option.text = o.display;
            option.selected = o.id === (await requestSettings()).clickBehavior;
            return option;
        })
            .forEach(optionPromise => optionPromise.then(o => select.append(o)))

        select.addEventListener("change", async e => {
            const selectedOption = parseInt((e.target as HTMLSelectElement).value);
            const selectedOptionValue = ClickBehaviorOption.fromId(selectedOption);
            if (!selectedOption) {
                return;
            }
            postMessage({
                identifier: ExtensionMessageId.SETTINGS_CLICK_BEHAVIOR_CHANGED,
                message: selectedOptionValue.id
            } as ExtensionMessage<number>)
        })

        listenToExtensionMessage<ExtensionSettings>(ExtensionMessageId.SETTINGS_IMPORT_SUCCESSFUL, es => {
            for (let option of select.options) {
                option.selected = option.value === es.clickBehavior.toString();
            }
        })
        return controlGroup;
    }
    private static async createDefaultLanguageSetting() {
        const controlGroup = document.createElement("div");
        controlGroup.classList.add("control-group");

        controlGroup.id = "csic-setting-default-language";

        const label = document.createElement("label");
        controlGroup.append(label);
        label.textContent = "Default language";
        label.htmlFor = "csic-settings-default-language-select";

        const select = document.createElement("select");
        controlGroup.append(select);
        select.id = label.htmlFor;
        select.name = select.id;
        select.classList.add("full-width");

        const currentDomain = await CommonContentScriptHelper.getCurrentInit().then(i => i.data.auth.domain);
        const currentDefault = await getDefaultLanguageForDomain(currentDomain);


        const noneOption = document.createElement("option");
        noneOption.value = String(INVALID_LANGUAGE);
        noneOption.text = "None";
        noneOption.selected = INVALID_LANGUAGE === currentDefault;
        select.append(noneOption);

        for (const l1 of (await CommonContentScriptHelper.getCurrentInit())
            .data.init_editor.project.target_languages
            .map(async l => {
                const option = document.createElement("option");
                option.value = l.id;
                option.text = l.name;
                option.selected = parseInt(l.id) === currentDefault;
                return option;
            })) {
            l1.then(o => select.append(o));
        }

        let helpBlockText = "This will apply to all projects hosted in https://crowdin.com.";

        if (currentDomain) {
            helpBlockText = `This will apply to all projects hosted in the current Crowdin Enterprise instance (${currentDomain}).`;
        }

        const helpBlock = this.createHelpBlock(helpBlockText);
        controlGroup.append(helpBlock);

        select.addEventListener("change", async () => {
            postMessage({
                identifier: ExtensionMessageId.SETTINGS_DOMAIN_DEFAULT_LANGUAGE_CHANGED,
                message: new DomainLanguage(currentDomain, parseInt(select.value))
            } as ExtensionMessage<DomainLanguage>)
        })

        listenToExtensionMessage<number>(ExtensionMessageId.SETTINGS_DOMAIN_DEFAULT_LANGUAGE_SET_BY_NOTIFICATION, l => {
            for (let option of select.options) {
                option.selected = option.value === l.toString();
            }
            postExtensionMessage<DomainLanguage>(ExtensionMessageId.SETTINGS_DOMAIN_DEFAULT_LANGUAGE_CHANGED, new DomainLanguage(currentDomain, l));
        });

        listenToExtensionMessage<ExtensionSettings>(ExtensionMessageId.SETTINGS_IMPORT_SUCCESSFUL, es => this.whenDomainLanguageChanged(es, select));

        return controlGroup;

    }

    private static whenDomainLanguageChanged(es: ExtensionSettings, select: HTMLSelectElement) {
        getDefaultLanguageForCurrentDomainInSettings(es)
            .then(l => {
                for (let option of select.options) {
                    option.selected = option.value === l.toString();
                }
            });
    }

    private static createHelpBlock(text: string): HTMLDivElement {
        const helpBlock = document.createElement("div");
        helpBlock.classList.add("help-block", "small", "no-margin");
        helpBlock.textContent = text;
        return helpBlock;
    }


    private static createDialogButtonFooterElement(): HTMLDivElement {
        const outerDiv = document.createElement("div");
        outerDiv.classList.add(..."ui-dialog-buttonpane ui-widget-content ui-helper-clearfix".split(" "))

        const innerDiv = document.createElement("div");
        outerDiv.append(innerDiv);
        innerDiv.classList.add("ui-dialog-buttonset");

        const importButton = this.createDialogButton("⤵️ Import from clipboard", "csic-settings-btn-import");
        innerDiv.append(importButton);
        importButton.addEventListener("click", this.importSettingsFromClipboard)


        const exportButton = this.createDialogButton("⤴️ Export to clipboard", "csic-settings-btn-export");
        innerDiv.append(exportButton);
        exportButton.addEventListener("click", this.exportSettingsToClipboard)

        return outerDiv;
    }

    private static createDialogButton(labelText: string, buttonElementId: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.id = buttonElementId;
        button.type = "button";
        button.role = "button";
        button.ariaDisabled = "false";
        button.classList.add(..."ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only".split(" "));
        button.addEventListener("mouseenter", () => button.classList.add("ui-state-hover"));
        button.addEventListener("mouseleave", () => button.classList.remove("ui-state-hover"));
        button.addEventListener("mousedown", () => button.classList.add("ui-state-active"));
        button.addEventListener("mouseup", () => button.classList.remove("ui-state-active"));

        const labelSpan = document.createElement("span");
        button.appendChild(labelSpan);
        labelSpan.classList.add("ui-button-text");
        labelSpan.textContent = labelText;

        return button;
    }

    private static importSettingsFromClipboard() {
        navigator.clipboard.readText()
            .then(text => requestSettingsImport(text))
            .then(successful => postExtensionMessage(
                successful ? ExtensionMessageId.NOTIFICATION_SUCCESS : ExtensionMessageId.NOTIFICATION_ERROR,
                successful ? "Import successful!" : "Import failed!"
            ))
            .catch(() => postExtensionMessage(ExtensionMessageId.NOTIFICATION_ERROR, "Import failed!"))
    }

    private static exportSettingsToClipboard() {
        exportSettings()
            .then(text => navigator.clipboard.writeText(text))
            .then(() => postMessage({
                identifier: ExtensionMessageId.NOTIFICATION_SUCCESS,
                message: "Settings exported to clipboard!"
            } as ExtensionMessage<string>))
            .catch(() => postExtensionMessage(ExtensionMessageId.NOTIFICATION_ERROR, "Failed to export settings!"))
    }
}

injectExtensionScript('extension-settings-menu-inject.js');
