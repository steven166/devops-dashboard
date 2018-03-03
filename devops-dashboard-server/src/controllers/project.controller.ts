import * as winston from "winston";
import { BitbucketClient } from "../clients/bitbucket.client";
import { projectsCollection } from "../collections/projects/projects.collection";
import { bitbucket, collector } from "../config/property-keys";
import { Settings } from "../config/settings";
import { Controller } from "./controller";
import { Project } from "../collections/projects/project.model";

export class ProjectController implements Controller {

  private projectCodes: string[];
  private client: BitbucketClient;

  public init(): void {
    this.client = new BitbucketClient();
    this.projectCodes = Settings.getString(bitbucket.projects, "")
      .split(",")
      .map(project => project.toLowerCase());

    setInterval(() => {
      this.collect();
    }, Settings.get(collector.metadata.interval, 5 * 60 * 1000));
    this.collect();
  }

  private collect(): void {
    winston.info("Collecting projects");
    let startTime = Date.now();
    (async () => {
      let projects = await this.client.getProjects();

      for (let project of projects) {
        // Filter projects
        if (this.projectCodes.length > 0) {
          if (this.projectCodes.indexOf(project.key.toLowerCase()) === -1) {
            continue;
          }
        }

        await projectsCollection.service.update(this.mapProjectModel(project));
      }
    })().then(() => {
      let time = Date.now() - startTime;
      winston.info("Collecting projects done in " + time + "ms");
    }).catch(e => {
      winston.error("Collecting projects failed", e);
    });
  }

  private mapProjectModel(model: any): Project {
    return {
      _id: model.key,
      name: model.name
    };
  }

}
