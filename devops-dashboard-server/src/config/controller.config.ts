import { BranchController } from "../controllers/branch.controller";
import { BuildsController } from "../controllers/builds.controller";
import { Controller } from "../controllers/controller";
import { ProjectController } from "../controllers/project.controller";
import { PullRequestController } from "../controllers/pull-request.controller";
import { RepoController } from "../controllers/repo.controller";
import * as winston from "winston";

export class ControllerConfig {

  private controllers: Controller[] = [
    new ProjectController(),
    new RepoController(),
    new BranchController(),
    new PullRequestController(),
    new BuildsController()
  ];

  public async init(): Promise<void> {
    this.controllers.forEach(collector => {
      try {
        collector.init();
      } catch (e) {
        winston.error(e);
      }
    });
  }

}
