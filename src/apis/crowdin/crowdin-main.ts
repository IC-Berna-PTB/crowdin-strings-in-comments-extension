import {CrowdinUserProjects} from "../../util/crowdin/api/user-projects/crowdin-user-projects";

export async function getProjectId(url: URL): Promise<number | undefined> {
    let projectId = url.pathname.split("/")[2];
    const int = parseInt(projectId);
    if (int) {
        return int;
    } else {
        return await CrowdinUserProjects.getFromIdentifier(projectId)
            .then(up => {
                if (up) {
                    return up.id;
                }
                return undefined;
            });
    }
}

export async function getCurrentProjectId(): Promise<number | undefined> {
    return await getProjectId(new URL(window.location.href))
}

export function getFileId(url: URL): number | "all" {
    const fileId = url.pathname.split("/")[3];
    return fileId === "all" ? fileId : parseInt(fileId);
}
export function getSearchQuery(url: URL): string {
    return url.hash.replace("#q=", "")
}
