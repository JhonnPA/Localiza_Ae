import bcrypt from "bcrypt";

import { pool } from "../db.js";

const BCRYPT_COST = 12;
// hash falso pra quando o email não existe. Compara mesmo assim pro tempo de
// resposta não entregar quais emails estão cadastrados
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("usuario-inexistente", BCRYPT_COST);

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
    mustChangePassword: row.must_change_password,
    tokenVersion: row.token_version,
    createdAt: row.created_at,
  };
}

export async function findUserByCredentials(email, password) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const row = rows[0];
  const passwordMatches = await bcrypt.compare(password, row?.password_hash ?? DUMMY_PASSWORD_HASH);
  return row && passwordMatches ? toUser(row) : null;
}

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function isCurrentPassword(id, password) {
  const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [id]);
  return rows[0] ? bcrypt.compare(password, rows[0].password_hash) : false;
}

export async function findAllUsers() {
  const { rows } = await pool.query("SELECT * FROM users ORDER BY name");
  return rows.map(toUser);
}

export async function insertUser({ name, email, password, role, mustChangePassword = false }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, must_change_password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, passwordHash, role, mustChangePassword],
  );
  return toUser(rows[0]);
}

// desativar sobe a versão da sessão, então reativar depois não ressuscita tokens antigos
export async function updateUserActive(id, active) {
  const { rows } = await pool.query(
    `UPDATE users SET active = $1,
            token_version = token_version + CASE WHEN $1 THEN 0 ELSE 1 END
     WHERE id = $2
     RETURNING *`,
    [active, id],
  );
  return rows[0] ? toUser(rows[0]) : null;
}

// mustChangePassword = true quando é o gerente redefinindo (senha provisória).
// Sobe a versão da sessão: todo token emitido antes da troca para de valer.
export async function updatePassword(id, password, { mustChangePassword }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const { rows } = await pool.query(
    `UPDATE users SET password_hash = $1, must_change_password = $2,
            token_version = token_version + 1
     WHERE id = $3
     RETURNING *`,
    [passwordHash, mustChangePassword, id],
  );
  return rows[0] ? toUser(rows[0]) : null;
}
