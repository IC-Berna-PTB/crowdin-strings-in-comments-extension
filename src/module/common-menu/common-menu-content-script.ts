import {observeElementEvenIfNotReady} from "../../util/util";

observeElementEvenIfNotReady("#progress-widget", (e, d) => {
    const button = createButtonElement();

    const div = createRightSideToolbarContainer();
    div.id = "csic-settings-btn";
    div.append(button);
    e.after(div);
})

function createRightSideToolbarContainer(): HTMLDivElement {
    const divElement = document.createElement("div");
    divElement.classList.add("pull-right", "clearfix");
    return divElement;
}

function createButtonElement(): HTMLButtonElement {
    const buttonElement = document.createElement("button");
    buttonElement.classList.add("btn", "btn-icon");
    buttonElement.dataset.state = "closed";
    buttonElement.tabIndex = 1;

    const iconElement = document.createElement("i");
    iconElement.classList.add("static-icon-csic-puzzle-piece");

    buttonElement.append(iconElement);
    return buttonElement;
}