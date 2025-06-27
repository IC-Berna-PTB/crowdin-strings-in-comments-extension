export interface Htmleable {

    /**
     * Generates the HTML element that represents this object.
     */
    generateHtml(): HTMLElement | undefined;
}
