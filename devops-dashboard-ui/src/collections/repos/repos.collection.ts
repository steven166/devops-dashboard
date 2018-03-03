import { CollectionModel, createClientCollection, Database } from "crud-api-factory";
import { Repo } from "./repos.model";

export let reposCollection: CollectionModel<Repo>;

export function initReposCollection(basePath: string): void {
  reposCollection = createClientCollection<Repo>("repos", {
    parent: "projects",
    readOnly: true,
    basePath
  });
}
