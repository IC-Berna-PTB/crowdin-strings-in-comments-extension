import {Reference} from "../reference";
import {Htmleable} from "../../../../../util/html-eable";

export class ReferencedCsHighlightReel implements Reference, Htmleable {
    private url: URL;

    constructor(url: URL) {
        this.url = url;
    }

    generateHtml(): HTMLElement | undefined {
        const video = document.createElement("video");
        video.muted = true;
        video.controls = true;
        video.classList.add("csic-video");
        const source = document.createElement("source");
        source.src = this.url.toString();
        source.type = "video/webm";
        video.append(source);
        return video;
    }

}