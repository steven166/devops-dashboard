import {Branch} from "../branches/branch.model";
import {PullRequest} from "../pull-requests/pull-request.model";

export interface Repo {

  _id: string;
  projectId?: string;
  name?: string;
  branches?: Branch[];
  pullRequests?: PullRequest[];

}
