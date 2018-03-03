import * as request from "request";
import { Observable } from "rxjs/Observable";
import * as winston from "winston";
import { jenkins } from "../config/property-keys";
import { Settings } from "../config/settings";

export class JenkinsClient {

  private url: string;
  private username: string;
  private password: string;

  constructor() {
    this.url = Settings.getString(jenkins.url);
    this.username = Settings.getString(jenkins.username);
    this.password = Settings.getString(jenkins.password);
    if (!this.url){
      winston.warn("JENKINS_URL is missing");
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
      let authHeader = new Buffer(`${this.username}:${this.password}`).toString("base64");
      mergedOptions.headers.Authorization = `Basic ${authHeader}`;
      request(mergedOptions, (e, response, body) => {
        if (e) {
          let error = new Error(e);
          winston.error(`Error ${method} ${uri}`, error);
          observer.error(error);
        } else if (response.statusCode >= 404) {
          observer.next(null);
          observer.complete();
        } else if (response.statusCode >= 400) {
          let error = new Error(
            `${method} ${uri} responded with status ${response.statusCode} ${response.statusMessage}`);
          winston.warn(error.message);
          observer.error(error);
        } else {
          observer.next(JSON.parse(body));
          observer.complete();
        }
      });
    });
  }

  public getBranchBuilds(projectCode: string, repositorySlug: string): Promise<any> {
    return this.request("get",
      `/blue/rest/organizations/jenkins/pipelines/${projectCode}/${repositorySlug}/runs/`).toPromise();
  }

}
