import * as winston from "winston";
import { BitbucketClient } from "../clients/bitbucket.client";
import { projectsCollection } from "../collections/projects/projects.collection";
import { PullRequest } from "../collections/pull-requests/pull-request.model";
import { reposCollection } from "../collections/repos/repos.collection";
import { Repo } from "../collections/repos/repos.model";
import { collector } from "../config/property-keys";
import { Settings } from "../config/settings";
import { Controller } from "./controller";
import { pullRequestsCollection } from "../collections/pull-requests/pull-request.collection";

export class PullRequestController implements Controller {

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
    winston.info("Collect pull-requests for " + repo.projectId + "/" + repo._id);
    let pullRequests = await this.client.getPullRequests(repo.projectId, repo._id);

    for (let pullRequest of pullRequests) {

      let model = this.mapPullRequestModel(pullRequest, repo, repo.projectId);
      let existingPullRequest = await pullRequestsCollection.service.getOne(
        { selector: { projectId: repo.projectId, repoId: repo._id, _id: model._id } });
      if (existingPullRequest && existingPullRequest.build &&
        existingPullRequest.from.commit === model.from.commit) {
        model.build = existingPullRequest.build;
      }

      await pullRequestsCollection.service.update(model);
    }
  }

  private collect(): void {
    winston.info("Collecting pull-requests");
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
      winston.info("Collecting pull-requests done in " + time + "ms");
    }).catch(e => {
      winston.error("Collecting pull-requests failed", e);
    });
  }

  private mapPullRequestModel(model: any, repo: Repo, projectId: string): PullRequest {
    return {
      _id: "" + model.id,
      projectId,
      repoId: repo._id,
      name: model.title,
      description: model.description,
      version: model.version,
      open: model.open,
      createdDate: model.createdDate,
      updatedDate: model.updateDate,
      from: {
        branch: model.fromRef.displayId,
        commit: model.fromRef.latestCommit
      },
      to: {
        branch: model.toRef.displayId,
        commit: model.toRef.latestCommit
      },
      author: {
        name: model.author.name,
        email: model.author.email,
        _id: model.author.slug
      },
      approves: model.reviewers.filter(reviewer => reviewer.approved).length,
      tasks: model.properties.openTaskCount,
      comments: model.properties.commentCount,
      mergable: model.properties.mergeResult.current
    };
  }

}
