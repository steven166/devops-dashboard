import { CollectionModel, createClientCollection } from "crud-api-factory";
import { Branch } from "./branch.model";

export let branchesCollection: CollectionModel<Branch>;

export function initBranchesCollection(basePath: string): void {
  branchesCollection = createClientCollection<Branch>("branches", {
    parent: "repos",
    readOnly: true,
    basePath
  });
}
