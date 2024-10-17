const regex = getRegex()

function updateCommentElement(comment: CrowdinComment) {
    if (comment.references.length === 0) {
        return;
    }
    const element = document.getElementById(comment.elementId);
    if (element === null) {
        return;
    }
    element.innerHTML = comment.references
        .filter(r => r instanceof ReferencedStringActual)
        .filter(r => r.translation !== undefined)
        .map(r => `<div>${r.translation}</div>`)
        .join("<br>")
}

getCommentElements()
    .map(e => new CrowdinComment(e.id, Array.prototype.slice.call(e.getElementsByClassName("comment-item-text"))[0].innerText))
    .map(comment => getLinks(comment, regex))
    .map(comment => getApprovedTranslations(comment))
    .map(commentPromise => commentPromise.then(updateCommentElement))

class CrowdinComment {
    elementId: string;
    text: string;
    references: ReferencedString[];

    constructor(elementId: string, text: string, references: ReferencedString[] = []) {
        this.elementId = elementId;
        this.text = text;
        this.references = references;
    }

    withReferences(references: ReferencedString[]): CrowdinComment {
        return new CrowdinComment(this.elementId, this.text, references);
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

    static from(other: ReferencedString, source: string, translation?: string): ReferencedStringActual {
        return new ReferencedStringActual(other.getProjectId(), other.getStringId(), source, translation);
    }

    getProjectId(): number {
        return this.id.getProjectId();
    }

    getStringId(): number {
        return this.id.getStringId();
    }
}

class TranslationStatus {
    translated!: boolean;
    partially_translated!: boolean;
    approved!: boolean;
    partially_approved!: boolean;
}

class CrowdinPhraseResponseData {
    success!: boolean;
    top_suggestion!: string;
    translation_status!: TranslationStatus;
}

class CrowdinPhraseResponse {
    data!: CrowdinPhraseResponseData;
    version!: number;
}


function getCommentElements(): HTMLElement[] {
    const discussionsMessages = document.getElementById("discussions_messages");
    if (discussionsMessages === null) {
        return [];
    }
    return Array.prototype.slice.call(discussionsMessages.getElementsByTagName("li"));
}

function getLinks(comment: CrowdinComment, regex: RegExp): CrowdinComment {
    const references = comment.text.matchAll(regex).toArray().map(v => v.groups)
        .filter(g => g !== undefined)
        .map(g => new ReferencedStringId(parseInt(g["projectId"]), parseInt(g["identifier"])))
    return comment.withReferences(references);
}

function getApprovedTranslations(comment: CrowdinComment): Promise<CrowdinComment> {
    return Promise.all(comment.references.map(async r => getPhrase(r)))
        .then(r => comment.withReferences(r))
}

async function getPhrase(referencedString: ReferencedString): Promise<ReferencedString> {
    return await fetch(getPhraseUrl(referencedString.getProjectId(), getLanguageId(), referencedString.getStringId()), {credentials: "same-origin"})
        .then(r => r.text())
        .then(r => JSON.parse(r) as CrowdinPhraseResponse)
        .then(r => r.data)
        .then(r => {
            if (r.success) {
                return r;
            }
            throw new Error("Could not retrieve translation")
        })
        .then(r => new ReferencedStringActual(referencedString.getProjectId(), referencedString.getStringId(), "", r.top_suggestion));

}

function checkIfApproved(phraseData: CrowdinPhraseResponseData): boolean {
    return phraseData.success && phraseData.translation_status.approved;
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