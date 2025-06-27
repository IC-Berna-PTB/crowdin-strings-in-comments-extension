import {Htmleable} from "../../../../util/html-eable";

export interface Reference {

}

export function isHtmleable(reference: Reference): reference is Htmleable {
    return (<Htmleable>reference).generateHtml !== undefined;
}
