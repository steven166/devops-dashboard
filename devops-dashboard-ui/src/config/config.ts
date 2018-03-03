
import { initBranchesCollection } from "../collections/branches/branch.collection";
import { initProjectsCollection } from "../collections/projects/projects.collection";
import { initPullRequestsCollection } from "../collections/pull-requests/pull-request.collection";
import { initReposCollection } from "../collections/repos/repos.collection";

const basePath = "http://localhost:3001/api";
initProjectsCollection(basePath);
initReposCollection(basePath);
initBranchesCollection(basePath);
initPullRequestsCollection(basePath);
