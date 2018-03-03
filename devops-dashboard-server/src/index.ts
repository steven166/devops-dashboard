import * as winston from "winston";
import { CollectionConfig } from "./config/collection.config";
import { ControllerConfig } from "./config/controller.config";
import { DatabaseConfig } from "./config/database.config";
import { logger } from "./config/property-keys";
import { Settings } from "./config/settings";
import { WebConfig } from "./config/web.config";


(async () => {
  winston.configure({
    level: Settings.getString(logger.level),
    transports: [
      new (winston.transports.Console)()
    ]
  });

  let webConfig = new WebConfig();
  let databaseConfig = new DatabaseConfig();
  let collectionConfig = new CollectionConfig();
  let controllerConfig = new ControllerConfig();

  webConfig.init();
  await databaseConfig.init();
  await collectionConfig.init(webConfig.webServer, databaseConfig.database);

  webConfig.startWebServer();

  controllerConfig.init();

})().then().catch(e => {
  winston.error(e);
  process.exit(1);
});
