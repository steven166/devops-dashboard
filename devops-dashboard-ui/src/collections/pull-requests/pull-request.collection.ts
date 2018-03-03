import { CollectionModel, createClientCollection, Database } from "crud-api-factory";
import { PullRequest } from "./pull-request.model";

export let pullRequestsCollection: CollectionModel<PullRequest>;

export function initPullRequestsCollection(basePath: string): void {
  pullRequestsCollection = createClientCollection<PullRequest>("pull-requests", {
    parent: "repos",
    readOnly: true,
    basePath
  });
}
