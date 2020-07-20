import knex from "knex";

const connection = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "admin",
    database: "ecoleta",
  },
  useNullAsDefault: true,
});

export default connection;
