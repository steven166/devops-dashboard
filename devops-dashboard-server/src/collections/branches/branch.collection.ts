import { CollectionModel, createServiceCollection } from "crud-api-factory";
import { Branch } from "./branch.model";

export let branchesCollection: CollectionModel<Branch>;

export async function initBranchesCollection(webServer: any, database: any): Promise<void> {
  branchesCollection = await createServiceCollection<Branch>("branches", {
    webServer, database,
    parent: "repos",
    readOnly: true
  });
}
