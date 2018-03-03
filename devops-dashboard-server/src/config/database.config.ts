import { Database, MemoryRepository } from "crud-api-factory/index";

export class DatabaseConfig {

  private _database: Database;

  public async init(): Promise<void> {
    this._database = MemoryRepository;
  }

  public get database(): Database {
    return this._database;
  }

}
