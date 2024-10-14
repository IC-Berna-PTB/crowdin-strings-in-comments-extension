const regex = getRegex()

const commentElements = getCommentElements()
    .map(e => new CrowdinComment(e.id, Array.prototype.slice.call(e.getElementsByClassName("comment-item-text"))[0].innerText))
    .map(comment => getLinks(comment, regex))

class CrowdinComment {
    elementId: string;
    text: string;
    references: ReferencedString[];

    constructor(elementId: string, text: string, references: ReferencedString[] = []) {
        this.elementId = elementId;
        this.text = text;
        this.references = references;
    }
}

interface ReferencedString {
    getProjectId(): number;
    getStringId(): number;

}

class ReferencedStringId implements ReferencedString {
    projectId: number;
    stringId: number;

    constructor(projectId: number, stringId: number) {
        this.projectId = projectId;
        this.stringId = stringId;
    }

    getProjectId(): number {
        return this.projectId;
    }

    getStringId(): number {
        return this.stringId;
    }
}

class ReferencedStringActual implements ReferencedString {
    source: string;
    translation?: string;
    id: ReferencedStringId;

    constructor(projectId: number, stringId: number, source: string, translation?: string) {
        this.source = source;
        this.translation = translation;
        this.id = new ReferencedStringId(projectId, stringId);
    }

    getProjectId(): number {
        return this.id.getProjectId();
    }

    getStringId(): number {
        return this.id.getStringId();
    }
}


function getCommentElements(): HTMLElement[] {
    const discussionsMessages = document.getElementById("discussions_messages");
    if (discussionsMessages === null) {
        return [];
    }
    return Array.prototype.slice.call(discussionsMessages.getElementsByTagName("li"));
}

function getLinks(comment: CrowdinComment, regex: RegExp) {
    comment.text.matchAll(regex).map(v => v.groups)
        .filter(g => g !== undefined)
        .map(g => new ReferencedStringId(parseInt(g["projectId"]), parseInt(g["identifier"])))
}

function getApprovedTranslations(comment: CrowdinComment) {
    comment.references.map(r => getApprovedTranslation(r))
}

function getApprovedTranslation(referencedString: ReferencedString) {
    fetch(getPhraseUrl(referencedString.getProjectId(), getLanguageId(), referencedString.getStringId()), {credentials: "same-origin"})
    // TODO: Continue from here
}

function getPhraseUrl(projectId: number, languageId: number, stringId: number) {
    return `${window.location.origin}/backend/translation/phrase?project_id=${projectId}&target_language_id=${languageId}&translation_id=${stringId}`;
}

function getRegex() {
    return new RegExp(`${window.location.origin}/editor/(?<projectId>\\d+)\\S+#(?<identifier>\\d+)`, 'g')
}

function getLanguageId() {
    //@ts-ignore
    return crowdin.editor.target_language.id
}

function getCsrfToken() {
    const csrfTokenRegex = /csrf_token=(\S+);/
    let match = document.cookie.split(" ").map(c => c.match(csrfTokenRegex))!?.find(c => c !== null);
    if (match === undefined) {
        throw new Error(`Could not parse Csrf token: ${match}`);
    }
    return match[1];
}