import { CollectionModel, createClientCollection, StateList } from "crud-api-factory";
import { error } from "../../helpers/logger.helper";
import { Project } from "./project.model";

export let projectsCollection: CollectionModel<Project>;
export let projectList: StateList<Project>;

export function initProjectsCollection(basePath: string): void {
  projectsCollection = createClientCollection<Project>("projects", {
    readOnly: true,
    basePath
  });
  projectList = new StateList(projectsCollection.client);
  projectList.errorStream.next((e: any) => error(e.getMessage(), e));
}
