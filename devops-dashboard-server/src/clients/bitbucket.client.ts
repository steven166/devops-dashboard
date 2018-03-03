import * as request from "request";
import { Observable } from "rxjs/Observable";
import * as winston from "winston";
import { bitbucket } from "../config/property-keys";
import { Settings } from "../config/settings";

export class BitbucketClient {

  private url: string;
  private token: string;

  constructor() {
    this.url = Settings.getString(bitbucket.url);
    this.token = Settings.getString(bitbucket.token);
    if (!this.url){
      winston.warn("BITBUCKET_URL is missing");
    }
  }

  /**
   * Make a request
   * @param method
   * @param {string} uri
   * @param options
   * @returns {Observable<any>}
   */
  public request<T>(method: string, uri: string, options?: request.CoreOptions): Observable<T> {
    return Observable.create(observer => {
      winston.debug(`${method} ${uri}`);

      let mergedOptions: any = { ...options };
      if (mergedOptions.body) {
        winston.silly("Request: ", JSON.stringify(mergedOptions.body));
      }
      mergedOptions.baseUrl = this.url;
      mergedOptions.url = uri;
      mergedOptions.method = method;
      if (!mergedOptions.headers) {
        mergedOptions.headers = {};
      }
      mergedOptions.headers.Authorization = `Bearer ${this.token}`;
      request(mergedOptions, (e, response, body) => {
        if (e) {
          let error = new Error(e);
          winston.error(`Error ${method} ${uri}`, error);
          observer.error(error);
        } else if (response.statusCode >= 400) {
          let error = new Error(
            `${method} ${uri} responded with status ${response.statusCode} ${response.statusMessage}`);
          winston.warn(error.message);
          observer.error(error);
        } else {
          observer.next(body);
          observer.complete();
        }
      });
    });
  }

  public async getAllPages<T>(uri: string): Promise<T> {
    let result: any = JSON.parse(await this.request<string>("get", uri).toPromise());
    let values = result.values;
    let pageSize = result.size;
    let page = 1;
    while (!result.isLastPage) {
      page++;
      let offset = page * pageSize;
      result = JSON.parse(await this.request<string>("get",
        uri + "?limit=" + pageSize + "&start=" + offset).toPromise());
      result.values.forEach(value => values.push(value));
    }
    return values;
  }

  /**
   * Find latest release branch
   * @param {string} project
   * @param {string} repo
   * @returns {Observable<string>}
   */
  public getLatestReleaseBranch(project: string, repo: string): Observable<string> {
    return Observable.create(observer => {
      this.request<any>("get", `/rest/api/latest/projects/${project}/repos/${repo}/branches?size=1000`)
        .subscribe(resp => {
          if (resp.branches) {
            let filteredBranches = resp.branches.filter(branch => branch.displayId.indexOf("release/") === 0);
            if (filteredBranches.length > 0) {
              observer.next(filteredBranches[0].displayId);
            } else {
              observer.next(null);
            }
          } else {
            observer.next(null);
          }
        }, e => observer.error(e));
    });
  }

  /**
   * Download file
   * @param {string} project
   * @param {string} repo
   * @param {string} file
   * @param {string} branch
   */
  public getFile(project: string, repo: string, file: string, branch?: string): Observable<string> {
    let path = `/projects/${project}/repos/${repo}/raw/${file}`;
    if (branch) {
      path += `?at=${encodeURI(branch)}`;
    }
    return this.request("get", path);
  }

  public getProjects(): Promise<any> {
    return this.getAllPages(`/rest/api/latest/projects`);
  }

  public getRepositories(projectCode: string): Promise<any> {
    return this.getAllPages(`/rest/api/latest/projects/${projectCode}/repos`);
  }

  public getBranches(projectCode: string, repositorySlug: string): Promise<any> {
    return this.getAllPages(`/rest/api/latest/projects/${projectCode}/repos/${repositorySlug}/branches`);
  }

  public getPullRequests(projectCode: string, repositorySlug: string): Promise<any> {
    return this.getAllPages(`/rest/api/latest/projects/${projectCode}/repos/${repositorySlug}/pull-requests`);
  }

}
