import {CrowdinUserProject} from "./crowdin-user-project";
import {CrowdinUserProjectsResponse} from "./crowdin-user-projects-response";
import {getFetchParams} from "../../../getFetchParams";

export class CrowdinUserProjects {
    private static userProjects: CrowdinUserProject[] = null;

    static async getFromId(id: number): Promise<string | undefined> {
        if (!this.userProjects) {
            await this.reloadUserProjects();
        }
        return this.userProjects.find(up => up.id === id)?.name;
    }

    static async getFromIdentifier(identifier: string): Promise<CrowdinUserProject | undefined> {
        if (!this.userProjects) {
            await this.reloadUserProjects();
        }
        return this.userProjects.find(up => up.identifier === identifier);
    }

    public static async reloadUserProjects() {
        await fetch(`${window.location.origin}/backend/projects/get_user_projects`, getFetchParams())
            .then(r => r.text())
            .then(r => JSON.parse(r) as CrowdinUserProjectsResponse)
            .then(r => {
                this.userProjects = r.projects;
            })
    }
}

