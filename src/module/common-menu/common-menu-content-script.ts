import {injectExtensionScript, observeElementEvenIfNotReady} from "../../util/util";
import {ExtensionMessage, ExtensionMessageId} from "../strings-in-comments/aux-objects/extension-message";
import {BooleanishNumber, ExtensionSettings, getSettings} from "../../common/settings/extension-settings";
import {plainToInstance} from "class-transformer";
import {ClickBehaviorOption} from "../strings-in-comments/settings/click-behavior-option";

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

        const helpBlock = document.createElement("div");
        controlGroup.append(helpBlock);
        helpBlock.classList.add("help-block", "small", "no-margin");
        helpBlock.textContent = "When opening an URL without filter parameters, prevent Crowdin " +
            "from applying your latest used filter (e.g. CroQL) automatically."

        input.addEventListener("change", e => {
            const enabled = input.checked;
            postMessage({identifier: ExtensionMessageId.SETTINGS_PREVENT_PRE_FILTERS_CHANGED, message: enabled ? 1 : 0} as ExtensionMessage<BooleanishNumber>)
        })
        return controlGroup;
    }

    /*
    <div class="control-group" id="default_editor_view_section">
          <label class="disabled" for="default_editor_view">
            Default Editor View
          </label>
          <select id="default_editor_view" name="default_editor_view" class="full-width">

        <option value="from_account_defaults">Side-by-side (organization default)</option>

            <option value="side-by-side">Side-by-side</option>
            <option value="comfortable">Comfortable</option>
            <option value="multilingual">Multilingual</option>
            <option value="multilingual_grid">Multilingual (Grid)</option>
          </select>
          <div class="help-block small no-margin">
            When view is specified in the URL, the Editor will display that view instead.
          </div>
        </div>
     */

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
