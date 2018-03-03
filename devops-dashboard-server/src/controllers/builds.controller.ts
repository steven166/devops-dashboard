import * as winston from "winston";
import { JenkinsClient } from "../clients/jenkins.client";
import { branchesCollection } from "../collections/branches/branch.collection";
import { BuildModel, BuildStatus } from "../collections/build.model";
import { projectsCollection } from "../collections/projects/projects.collection";
import { pullRequestsCollection } from "../collections/pull-requests/pull-request.collection";
import { reposCollection } from "../collections/repos/repos.collection";
import { Repo } from "../collections/repos/repos.model";
import { collector } from "../config/property-keys";
import { Settings } from "../config/settings";
import { Controller } from "./controller";

export class BuildsController implements Controller {

  private client: JenkinsClient;
  private latestCrawls: { [key: string]: number } = {};

  public init(): void {
    this.client = new JenkinsClient();

    setInterval(() => {
      this.collect();
    }, Settings.get(collector.builds.interval, 30 * 1000));
    this.collect();

    this.watchBranches();
    this.watchPullRequest();
  }

  private watchBranches(): void {
    branchesCollection.service.watch({ selector: {} }).subscribe(event => {
      if (event.type === "UPDATED" && !event.model.build) {
        this.collectRepo(event.model).catch(e => {
          winston.error(e);
        });
      }
    }, e => {
      setTimeout(() => {
        this.watchBranches();
      }, 100);
    });
  }

  private watchPullRequest(): void {
    pullRequestsCollection.service.watch({ selector: {} }).subscribe(event => {
      if (event.type === "UPDATED" && !event.model.build) {
        this.collectRepo(event.model).catch(e => {
          winston.error(e);
        });
      }
    }, e => {
      setTimeout(() => {
        this.watchPullRequest();
      }, 100);
    });
  }

  private async collectRepo(repo: Repo): Promise<void> {
    let lastStarted = this.latestCrawls[`${repo.projectId}/${repo._id}`];
    let now = Date.now();
    if (lastStarted && lastStarted + 10000 > now) {
      return;
    }
    this.latestCrawls[`${repo.projectId}/${repo._id}`] = now;

    winston.info("Collect builds for " + repo.projectId + "/" + repo._id);
    let builds = await this.client.getBranchBuilds(repo.projectId, repo._id);

    if (builds) {
      for (let build of builds) {
        if (build.pipeline) {
          let status = BuildStatus.UNKNOWN;
          if (build.result === "SUCCESS") {
            status = BuildStatus.SUCCEED;
          } else if (build.result === "FAILURE") {
            status = BuildStatus.FAILED;
          } else if (build.result === "ABORTED") {
            status = BuildStatus.ABORTED;
          } else if (build.state === "RUNNING") {
            status = BuildStatus.IN_PROGRESS;
          }

          let buildModel: BuildModel = {
            status,
            startTime: build.startTime,
            expectedDuration: build.estimatedDurationInMillis,
            duration: build.durationInMillis
          };

          if (build.pipeline.indexOf("PR-") === 0) {
            // pull request
            let id = build.pipeline.substring(3);
            let pullRequest = await pullRequestsCollection.service.getOne(
              { selector: { _id: id, projectId: repo.projectId, repoId: repo._id } });
            if (pullRequest) {
              if ((pullRequest.from.commit === build.commitId.split("+")[0])) {
                pullRequest.build = buildModel;
                await pullRequestsCollection.service.update(pullRequest);
              }
            }
          } else {
            // branch
            let id = build.pipeline;
            let branch = await branchesCollection.service.getOne(
              { selector: { _id: id, projectId: repo.projectId, repoId: repo._id } });
            if (branch) {
              if ((branch.commit === build.commitId)) {
                branch.build = buildModel;
                await branchesCollection.service.update(branch);
              }
            }
          }
        }
      }
    }
  }

  private collect(): void {
    winston.info("Collecting builds");
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
      winston.info("Collecting builds done in " + time + "ms");
    }).catch(e => {
      winston.error("Collecting builds failed", e);
    });
  }

}
