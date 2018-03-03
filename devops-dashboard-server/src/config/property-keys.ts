/**
 * Database properties
 */
export const db = {
  url: "db.url"
};

/**
 * Web properties
 */
export const web = {
  port: "web.port"
};

/**
 * Logger properties
 */
export const logger = {
  level: "logger.level"
};

/**
 * Bitbucket properties
 */
export const bitbucket = {
  url: "bitbucket.url",
  token: "bitbucket.token",
  projects: "bitbucket.projects",
  ignore_repos: "bitbucket.ignore_repos"
};

/**
 * Jenkins properties
 */
export const jenkins = {
  url: "jenkins.url",
  username: "jenkins.username",
  password: "jenkins.password"
};

/**
 * Collector properties
 */
export const collector = {
  metadata: {
    interval: "collector.metadata.interval",
  },
  gitdata: {
    interval: "collector.gitdata.interval",
  },
  builds: {
    interval: "collector.builds.interval",
  }
};