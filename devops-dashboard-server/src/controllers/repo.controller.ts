import * as winston from "winston";
import { BitbucketClient } from "../clients/bitbucket.client";
import { Project } from "../collections/projects/project.model";
import { projectsCollection } from "../collections/projects/projects.collection";
import { reposCollection } from "../collections/repos/repos.collection";
import { Repo } from "../collections/repos/repos.model";
import { bitbucket, collector } from "../config/property-keys";
import { Settings } from "../config/settings";
import { Controller } from "./controller";

export class RepoController implements Controller {

  private ignoreRepos: string[];
  private client: BitbucketClient;

  public init(): void {
    this.client = new BitbucketClient();
    this.ignoreRepos = [];
    let s = Settings.getString(bitbucket.ignore_repos, "");
    if (s) {
      this.ignoreRepos = s.split(",")
        .map(repo => repo.toLowerCase());
    }

    setInterval(() => {
      this.collect();
    }, Settings.get(collector.metadata.interval, 5 * 60 * 1000));
    this.collect();

    this.watch();

  }

  private watch(): void {
    projectsCollection.service.onPostUpdate(async () => {

    });

    projectsCollection.service.watch({ selector: {} }).subscribe(event => {
      if (event.type === "UPDATED") {
        this.collectProject(event.model).catch(e => {
          winston.error(e);
        });
      }
    }, e => {
      setTimeout(() => {
        this.watch();
      }, 100);
    });
  }

  private async collectProject(project: Project): Promise<void> {
    winston.info("Collect repositories for " + project._id);
    let repos = await this.client.getRepositories(project._id);

    for (let repo of repos) {
      // Filter repos
      if (this.ignoreRepos.length > 0) {
        if (this.ignoreRepos.indexOf(repo.slug.toLowerCase()) !== -1) {
          continue;
        }
      }

      await reposCollection.service.update(this.mapRepositoryModel(repo, project));
    }
  }

  private collect(): void {
    winston.info("Collecting repos");
    let startTime = Date.now();
    (async () => {
      let projects = await projectsCollection.service.getAll({ selector: {} }).toArray().toPromise();

      for (let project of projects) {
        await this.collectProject(project);
      }
    })().then(() => {
      let time = Date.now() - startTime;
      winston.info("Collecting repositories done in " + time + "ms");
    }).catch(e => {
      winston.error("Collecting repositories failed", e);
    });
  }

  private mapRepositoryModel(model: any, project: Project): Repo {
    return {
      _id: model.slug,
      projectId: project._id,
      name: model.name
    };
  }

}
