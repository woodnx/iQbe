import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { validateJwtSecret } from "./plugins/validateJwtSecret.js";

validateJwtSecret(process.env.JWT_SECRET_KEY);

serve({ fetch: createApp().fetch, port: 9000 }, () => {
  console.log("Opened http://localhost:9000/");
});
