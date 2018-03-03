
import { BuildModel } from "../build.model";

export interface Branch {

  _id: string;
  name: string;
  projectId: string;
  repoId: string;
  commit: string;
  isDefault: boolean;
  build?: BuildModel;

}
