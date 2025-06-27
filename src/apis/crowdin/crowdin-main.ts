export function getProjectId(url: URL): number {
    return parseInt(url.pathname.split("/")[2])
}

export function getCurrentProjectId(): number {
    return getProjectId(new URL(window.location.href))
}

export function getFileId(url: URL): number | "all" {
    const fileId = url.pathname.split("/")[3];
    return fileId === "all" ? fileId : parseInt(fileId);
}
export function getSearchQuery(url: URL): string {
    return url.hash.replace("#q=", "")
}
