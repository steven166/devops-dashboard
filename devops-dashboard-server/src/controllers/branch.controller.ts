import * as winston from "winston";
import { BitbucketClient } from "../clients/bitbucket.client";
import { branchesCollection } from "../collections/branches/branch.collection";
import { Branch } from "../collections/branches/branch.model";
import { projectsCollection } from "../collections/projects/projects.collection";
import { reposCollection } from "../collections/repos/repos.collection";
import { Repo } from "../collections/repos/repos.model";
import { collector } from "../config/property-keys";
import { Settings } from "../config/settings";
import { Controller } from "./controller";

export class BranchController implements Controller {

  private client: BitbucketClient;

  public init(): void {
    this.client = new BitbucketClient();

    setInterval(() => {
      this.collect();
    }, Settings.get(collector.gitdata.interval, 60 * 1000));
    this.collect();

    this.watch();
  }

  private watch(): void {
    reposCollection.service.watch({ selector: {} }).subscribe(event => {
      if (event.type === "UPDATED") {
        this.collectRepo(event.model).catch(e => {
          winston.error(e);
        });
      }
    }, e => {
      setTimeout(() => {
        this.watch();
      }, 100);
    });
  }

  private async collectRepo(repo: Repo): Promise<void> {
    winston.info("Collect branches for " + repo.projectId + "/" + repo._id);
    let branches = await this.client.getBranches(repo.projectId, repo._id);

    for (let branch of branches) {

      let model = this.mapBranchModel(branch, repo, repo.projectId);
      let existingBranch = await branchesCollection.service.getOne(
        { selector: { projectId: repo.projectId, repoId: repo._id, _id: model._id } });
      if (existingBranch && existingBranch.build && existingBranch.commit === model.commit) {
        model.build = existingBranch.build;
      }
      await branchesCollection.service.update(model);
    }
  }

  private collect(): void {
    winston.info("Collecting branches");
    let startTime = Date.now();
    (async () => {
      let projects = await projectsCollection.service.getAll({ selector: {} }).toArray().toPromise();

      for (let project of projects) {
        let repos = await reposCollection.service.getAll({ selector: { projectId: project._id } }).toArray()
          .toPromise();
        for (let repo of repos) {
          await this.collectRepo(repo);
        }
      }
    })().then(() => {
      let time = Date.now() - startTime;
      winston.info("Collecting branches done in " + time + "ms");
    }).catch(e => {
      winston.error("Collecting branches failed", e);
    });
  }

  private mapBranchModel(model: any, repo: Repo, projectId: string): Branch {
    return {
      _id: model.displayId,
      name: model.displayId,
      projectId,
      repoId: repo._id,
      commit: model.latestCommit,
      isDefault: model.isDefault
    };
  }

}
