import { pool } from "../db.js";

export async function findAllClients() {
  const { rows } = await pool.query("SELECT * FROM clients ORDER BY name");
  return rows;
}

export async function findClientById(id) {
  const { rows } = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function insertClient({ name, cpf, phone, email }) {
  const { rows } = await pool.query(
    `INSERT INTO clients (name, cpf, phone, email)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, cpf, phone, email],
  );
  return rows[0];
}

export async function updateClientActive(id, active) {
  const { rows } = await pool.query("UPDATE clients SET active = $1 WHERE id = $2 RETURNING *", [
    active,
    id,
  ]);
  return rows[0] ?? null;
}

// Checa se está inativo e apaga no mesmo DELETE. Em duas queries dava pra
// reativar o cliente no meio e ele seria apagado mesmo assim.
// As reservas vão junto por causa do ON DELETE CASCADE.
export async function deleteInactiveClient(id) {
  const { rows } = await pool.query(
    "DELETE FROM clients WHERE id = $1 AND active = false RETURNING *",
    [id],
  );
  return rows[0] ?? null;
}
