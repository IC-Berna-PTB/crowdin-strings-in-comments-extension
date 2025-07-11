import {injectExtensionScript, observeElementEvenIfNotReady} from "../../util/util";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {
    BooleanishNumber, getSettings
} from "../../common/settings/extension-settings";
import {ClickBehaviorOption} from "../strings-in-comments/settings/click-behavior-option";
import {CommonContentScriptHelper} from "../../common/common-content-script-helper";
import {
    DomainLanguage,
    getDefaultLanguageForDomain,
    INVALID_LANGUAGE
} from "../default-language/default-language-helper";

class CommonMenu {

    static INSTANCE = new CommonMenu();

    constructor() {
        observeElementEvenIfNotReady("#progress-widget", (element, disconnect) => {
            disconnect();
            const button = CommonMenu.createButtonElement();
            const dialog = CommonMenu.createSettingsDialog();

            let dialogBody = dialog.querySelector("#csic-settings-dialog-body");
            const clickBehavior = CommonMenu.createClickBehaviorSetting();
            dialogBody.appendChild(clickBehavior);

            const preventPreFilter = CommonMenu.createPreventPreFilterSetting();
            dialogBody.appendChild(preventPreFilter);

            CommonMenu.createDefaultLanguageSetting()
                .then(l => dialogBody.appendChild(l))

            document.body.append(dialog);
            // const menu = this.createSettingsMenu();
            // this.test(menu, "Test");

            const buttonDiv = CommonMenu.createRightSideToolbarContainer();
            buttonDiv.id = "csic-settings-btn";
            buttonDiv.title = 'Open "Crowdin Strings in Comments" extension settings'

            buttonDiv.append(button);
            // buttonDiv.append(menu);
            // buttonDiv.addEventListener("click", () => this.divElementListener(buttonDiv));
            buttonDiv.addEventListener("click", () => CommonMenu.toggleDialog(dialog))

            element.after(buttonDiv);
        })
    }


    private static createRightSideToolbarContainer(): HTMLDivElement {
        const divElement = document.createElement("div");
        divElement.classList.add("pull-right", "clearfix", "btn-group");
        return divElement;
    }

    private static createButtonElement(): HTMLButtonElement {
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
        title.innerText = "Crowdin Strings in Comments settings";

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
        controlGroup.id = "csic-test-section";

        const label = document.createElement("label");
        controlGroup.append(label);
        label.textContent = "Clicking on a translation in a comment...";
        label.htmlFor = "csic-test-section-select";

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
            option.selected = o.id === (await getSettings()).clickBehavior;
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

        // const hint = document.createElement("div");
        // controlGroup.append(hint);
        // hint.classList.add(..."help-block small no-margin".split(" "));
        // hint.textContent = "Select the default language lorem ipsum";

        return controlGroup;
    }

    private static createPreventPreFilterSetting(): HTMLElement {
        const controlGroup = document.createElement("div");
        controlGroup.classList.add("control-group", "margin-top");

        const label = document.createElement("label");
        controlGroup.append(label);
        label.textContent = `Always open URLs without filters in  "Show All" mode`
        label.classList.add("checkbox");

        const input = document.createElement("input");
        label.append(input);
        input.id = "csic-setting-prevent-pre-filter";
        input.type = "checkbox";
        input.name = "csic-setting-prevent-pre-filter";
        getSettings().then(s => input.checked = !!s.preventPreFilter);

        const helpBlock = this.createHelpBlock("When opening an URL without filter parameters, prevent Crowdin " +
            "from applying your latest used filter (e.g. CroQL) automatically.");
        controlGroup.append(helpBlock);

        input.addEventListener("change", () => {
            const enabled = input.checked;
            postMessage({identifier: ExtensionMessageId.SETTINGS_PREVENT_PRE_FILTERS_CHANGED, message: enabled ? 1 : 0} as ExtensionMessage<BooleanishNumber>)
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

        select.addEventListener("change", async e => {
            postMessage({
                identifier: ExtensionMessageId.SETTINGS_DOMAIN_DEFAULT_LANGUAGE_CHANGED,
                message: new DomainLanguage(currentDomain, parseInt(select.value))
            } as ExtensionMessage<DomainLanguage>)
        })
        return controlGroup;

    }

    private static createHelpBlock(text: string): HTMLDivElement {
        const helpBlock = document.createElement("div");
        helpBlock.classList.add("help-block", "small", "no-margin");
        helpBlock.textContent = text;
        return helpBlock;
    }

    createSettingsMenu(): HTMLUListElement {
        const listElement = document.createElement("ul");
        listElement.id = "csic-settings-list";
        listElement.classList.add("dropdown-menu", "filter-holder");
        return listElement;
    }

    private static divElementListener(divElement: HTMLDivElement): void {
        divElement.classList.toggle("open");
    }

}

injectExtensionScript('common-menu-inject.js');
