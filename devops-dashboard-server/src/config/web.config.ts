import bodyParser = require("body-parser");
import * as cors from "cors";
import { createSwaggerEndpoint, ErrorMiddleware } from "crud-api-factory";
import * as Express from "express";
import * as winston from "winston";
import { web } from "./property-keys";
import { Settings } from "./settings";

/**
 * Configure the HTTP server
 * @author S. Hermans <s.hermans@maxxton.com>
 */
export class WebConfig {

  private _webServer: Express.Application;

  public init(): void {
    this._webServer = Express();
    this._webServer.use(cors());
    this._webServer.use(bodyParser.json());
  }

  public get webServer(): Express.Application {
    return this._webServer;
  }

  public startWebServer() {
    // Set after middleware
    createSwaggerEndpoint(this._webServer);
    this._webServer.use((req, res, next) => {
      try {
        let error: any = new Error("Not Found");
        error.status = 404;
        throw error;
      } catch (e) {
        next(e);
      }
    });
    this._webServer.use(ErrorMiddleware);

    // run express application
    const port = Settings.get(web.port, 8080);
    winston.info("Listen on port " + port);
    this._webServer.listen(port);
  }

}
