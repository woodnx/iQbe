import type { Knex } from "knex";
import _knex from "knex";
import knexfile from "./knexfile";

const environment: string = "development";
const config: Knex.Config = knexfile[environment];
const knex = _knex(config);

export default knex;
