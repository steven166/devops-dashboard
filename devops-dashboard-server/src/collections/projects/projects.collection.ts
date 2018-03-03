import { CollectionModel, createServiceCollection, Database } from "crud-api-factory";
import { Project } from "./project.model";

export let projectsCollection: CollectionModel<Project>;

export async function initProjectsCollection(webServer: any, database: Database): Promise<void> {
  projectsCollection = await createServiceCollection<Project>("projects", {
    webServer, database,
    readOnly: true
  });
}
