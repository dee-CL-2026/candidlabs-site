import { type AppEnv } from "../config/env";

export class DbClient {
  constructor(private readonly env: AppEnv) {}

  get binding(): D1Database {
    return this.env.DB;
  }
}
