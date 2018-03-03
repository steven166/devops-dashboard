
import { Database } from "crud-api-factory";
import { Application } from "express";
import { initProjectsCollection } from "../collections/projects/projects.collection";
import { initReposCollection } from "../collections/repos/repos.collection";
import { initBranchesCollection } from "../collections/branches/branch.collection";
import { initPullRequestsCollection } from "../collections/pull-requests/pull-request.collection";

export class CollectionConfig {

  public async init(webServer: Application, database: Database): Promise<void> {
    await initProjectsCollection(webServer, database);
    await initReposCollection(webServer, database);
    await initBranchesCollection(webServer, database);
    await initPullRequestsCollection(webServer, database);
  }

}
