import { CollectionModel, createServiceCollection, Database } from "crud-api-factory";
import { PullRequest } from "./pull-request.model";

export let pullRequestsCollection: CollectionModel<PullRequest>;

export async function initPullRequestsCollection(webServer: any, database: Database): Promise<void> {
  pullRequestsCollection = await createServiceCollection<PullRequest>("pull-requests", {
    webServer, database,
    parent: "repos",
    readOnly: true
  });
}
