import * as React from "react";
import {Branch} from "../../collections/branches/branch.model";
import {BuildStatus as Status} from "../../collections/build.model";
import {PullRequest} from "../../collections/pull-requests/pull-request.model";
import {Repo} from "../../collections/repos/repos.model";
import {getLatestReleaseBranch} from "../../helpers/repo.helper";
import BuildStatus from "../build-status/BuildStatus";
import "./RepoOverview.css";

export default class RepoOverview extends React.Component<{ repo: Repo }, any> {
  
  public render() {
    let repo = this.props.repo;
    let developBranch: Branch;
    let releaseBranch: Branch;
    let masterBranch: Branch;
    
    let hasPrs = false;
    let developPrs: PullRequest[] = [];
    let releasePrs: PullRequest[] = [];
    let masterPrs: PullRequest[] = [];
    
    let developPrsOk: number = 0;
    let developPrsProblem: number = 0;
    let releasePrsOk: number = 0;
    let releasePrsProblem: number = 0;
    let masterPrsOk: number = 0;
    let masterPrsProblem: number = 0;
    
    let isDevRelease: boolean = false;
    let releasMasterPr: PullRequest = null;
    
    if (repo.branches) {
      developBranch = repo.branches.filter(branch => branch._id === "develop")[0];
      releaseBranch = getLatestReleaseBranch(repo);
      masterBranch = repo.branches.filter(branch => branch._id === "master")[0];
      
      if (repo.pullRequests) {
        let prs = repo.pullRequests
          .filter(pr => !(releaseBranch && masterBranch &&
            pr.from.branch === releaseBranch.name && pr.to.branch === masterBranch.name));
        prs.forEach(pr => {
          if (developBranch) {
            if (pr.to.branch === developBranch.name) {
              developPrs.push(pr);
              if (pr.build && pr.build.status === Status.SUCCEED) {
                developPrsOk++;
              } else {
                developPrsProblem++;
              }
            }
          }
          if (releaseBranch) {
            if (pr.to.branch === releaseBranch.name) {
              releasePrs.push(pr);
              if (pr.build && pr.build.status === Status.SUCCEED) {
                releasePrsOk++;
              } else {
                releasePrsProblem++;
              }
            }
          }
          if (masterBranch) {
            if (pr.to.branch === masterBranch.name) {
              masterPrs.push(pr);
              if (pr.build && pr.build.status === Status.SUCCEED) {
                masterPrsOk++;
              } else {
                masterPrsProblem++;
              }
            }
          }
        });
        if (developPrs.length > 0 || releasePrs.length > 0 || masterPrs.length > 0) {
          hasPrs = true;
        }
        
        releasMasterPr = repo.pullRequests
          .filter(pr => releaseBranch && masterBranch &&
            pr.from.branch === releaseBranch.name && pr.to.branch === masterBranch.name)[0];
      }
      
      isDevRelease = developBranch && releaseBranch && developBranch.commit === releaseBranch.commit;
    }
    
    return (
      <div className="repo-overview">
        <h1>{this.props.repo.name}</h1>
        {hasPrs && (
          <div className="pr-model">
            {developPrs.length > 0 && (
              <div className="dev-prs prs">
                <i className="material-icons">arrow_forward</i>
                <span className="pr-label">
                  <span className="ok">{developPrsOk}</span> | <span className="problem">{developPrsProblem}</span>
                </span>
              </div>
            )}
            {releasePrs.length > 0 && (
              <div className="release-prs prs">
                <i className="material-icons">arrow_forward</i>
                <span className="pr-label">
                  <span className="ok">{releasePrsOk}</span> | <span className="problem">{releasePrsProblem}</span>
                </span>
              </div>
            )}
            {masterPrs.length > 0 && (
              <div className="master-prs prs">
                <i className="material-icons">arrow_forward</i>
                <span className="pr-label">
                  <span className="ok">{masterPrsOk}</span> | <span className="problem">{masterPrsProblem}</span>
               </span>
              </div>
            )}
          </div>
        )}
        <div className="branch-model">
          <div className="dev-branch branch">
            <BuildStatus/>
            <span className="branch-name">{developBranch ? developBranch.name : "Develop branch Not Found"}</span>
          </div>
          <div className="release-branch branch">
            <BuildStatus/>
            <span className="branch-name">{releaseBranch ? releaseBranch.name : "Release branch Not Found"}</span>
          </div>
          <div className="master-branch branch">
            <BuildStatus/>
            <span className="branch-name">{masterBranch ? masterBranch.name : "Master branch Not Found"}</span>
          </div>
          {isDevRelease && (
            <div className="dev-release">
              <div className="bar"/>
              <i className="material-icons">arrow_forward</i>
            </div>
          )}
          {releasMasterPr && (
            <div className="release-master">
              <div className="bar"/>
              <i className="material-icons">arrow_forward</i>
            </div>
          )}
        </div>
      </div>
    );
  }
  
}
