import { authMiddleware } from "@/middlewares/authMiddleware";
import { paths } from "api/schema";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

const client = createFetchClient<paths>({ baseUrl: "http://localhost:9000/api/" });
const $api = createClient(client)

client.use(authMiddleware);

export {
  client,
  $api
}