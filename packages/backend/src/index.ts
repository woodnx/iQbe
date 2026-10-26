import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

serve({ fetch: createApp().fetch, port: 9000 }, () => {
  console.log("Opened http://localhost:9000/");
});
