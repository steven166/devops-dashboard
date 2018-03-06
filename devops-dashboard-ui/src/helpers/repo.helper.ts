import * as winston from "winston";
import {Branch} from "../collections/branches/branch.model";
import {Repo} from "../collections/repos/repos.model";

/**
 * Find latest release branch based on regex
 * @param {Repo} repo
 * @param {RegExp} regex
 * @return {Branch}
 */
export function getLatestReleaseBranch(repo: Repo, regex: RegExp = /(\d+)\.(\d+)\.(\d+)/): Branch {
  let latestBranch: Branch;
  let versions: number[] = [];
  if (repo.branches) {
    for (let branch of repo.branches) {
      let match = branch.name.match(regex);
      if (match && match.length > 0) {
        try {
          match.splice(0, 1);
          if (latestBranch) {
            for (let i = 0; i < match.length; i++) {
              if (versions[i]) {
                let cVersion = versions[i];
                let mVersion = parseInt(match[i]);
                if (mVersion > cVersion) {
                  versions = match.map(m => parseInt(m));
                  latestBranch = branch;
                  break;
                } else if (mVersion < cVersion) {
                  break;
                }
              }
            }
          } else {
            versions = match.map(m => parseInt(m));
            latestBranch = branch;
          }
        } catch (e) {
          winston.warn("Failed to parse " + branch.name, e);
        }
      }
    }
  }
  return latestBranch;
}
