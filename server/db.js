import pg from "pg";

import { config } from "./config.js";

const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";

// deixa DATE como texto AAAA-MM-DD, senão o pg converte pra Date e o fuso muda o dia
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

export const pool = new pg.Pool(config.database);

export function isUniqueViolation(error) {
  return error.code === PG_UNIQUE_VIOLATION;
}

export function isForeignKeyViolation(error) {
  return error.code === PG_FOREIGN_KEY_VIOLATION;
}
