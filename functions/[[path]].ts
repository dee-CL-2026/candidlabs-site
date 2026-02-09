import app from "../src/index";
import type { AppEnv } from "../src/config/env";

export const onRequest: PagesFunction<AppEnv> = async (context) => {
  return app.fetch(context.request, context.env as unknown as AppEnv);
};
