import { CollectionModel, createServiceCollection, Database } from "crud-api-factory";
import { Repo } from "./repos.model";

export let reposCollection: CollectionModel<Repo>;

export async function initReposCollection(webServer: any, database: Database): Promise<void> {
  reposCollection = await createServiceCollection<Repo>("repos", {
    webServer, database,
    parent: "projects",
    readOnly: true
  });
}
