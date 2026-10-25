import { knex as createKnex, type Knex } from "knex";
import knexfile from "./knexfile.js";

const environment: string = "development";
const config: Knex.Config = knexfile[environment];
const knex = createKnex(config);

export default knex;
