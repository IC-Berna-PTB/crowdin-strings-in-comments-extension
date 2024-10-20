import {getFetchParams} from "../../util";
import {CrowdinUserProject} from "./crowdin-user-project";
import {CrowdinUserProjectsResponse} from "./crowdin-user-projects-response";

export class CrowdinUserProjects {
    private static userProjects: CrowdinUserProject[] = [];

    static async getFromId(id: number): Promise<string | undefined> {
        if (this.userProjects.length === 0) {
            await CrowdinUserProjects.reloadUserProjects()
        }
        console.log(this.userProjects);
        return this.userProjects.find(up => up.id === id)?.name;
    }

    private static async reloadUserProjects<R>() {
        await fetch(`${window.location.origin}/backend/projects/get_user_projects`, getFetchParams())
            .then(r => r.text())
            .then(r => JSON.parse(r) as CrowdinUserProjectsResponse)
            .then(r => this.userProjects = r.projects)
    }
}

