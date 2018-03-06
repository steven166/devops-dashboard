
import { BuildModel } from "../build.model";

export interface PullRequest {

  _id: string;
  projectId: string;
  repoId: string;
  name: string;
  description?: string;
  version?: number;
  open?: boolean;
  createdDate?: number;
  updatedDate?: number;
  from: {
    branch: string;
    commit: string;
  };
  to: {
    branch: string;
    commit: string;
  };
  author?: {
    name: string;
    email: string;
    _id: string;
  };
  approves?: number;
  tasks?: number;
  mergable?: boolean;
  comments?: number;
  build?: BuildModel;

}
