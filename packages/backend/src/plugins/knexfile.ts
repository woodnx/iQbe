import type { Knex } from "knex";
import db_info from '@/db-info.json'

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: db_info,
    pool: {
      min: 2,
      max: 10
    },
  },

  staging: {
    client: "mysql2",
    connection: db_info,
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    client: "mysql2",
    connection: db_info,
    pool: {
      min: 2,
      max: 10
    },
  }

};

export default config;
