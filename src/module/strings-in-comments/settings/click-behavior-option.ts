export class ClickBehaviorOption {
    static readonly COPY_TO_CLIPBOARD = new ClickBehaviorOption(1, "Copies it to the clipboard");
    static readonly INSERT_CARET = new ClickBehaviorOption(2, "Inserts it in the caret position");

    static readonly VALUES = [ClickBehaviorOption.COPY_TO_CLIPBOARD, ClickBehaviorOption.INSERT_CARET];

    readonly id: number;
    readonly display: string;

    constructor(id: number, display: string) {
        this.id = id;
        this.display = display;
    }

    static fromId(id: number): ClickBehaviorOption | undefined {
        return this.VALUES.find(o => o.id === id);
    }
}