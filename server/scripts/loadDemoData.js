// Carrega os dados de exemplo (clientes e reservas) e cria um funcionário de teste.
// Uso: npm run demo-data
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

import { USER_ROLE } from "../../shared/domain.js";
import { pool } from "../db.js";
import { insertUser } from "../repositories/userRepository.js";

const DEMO_SQL = readFileSync(new URL("./demo-data.sql", import.meta.url), "utf8");
const DEMO_EMPLOYEE_EMAIL = "funcionario@empresa.com";
// um dos CPFs do demo-data.sql, usado pra saber se os dados já foram carregados
const DEMO_CLIENT_CPF = "529.982.247-25";

try {
  const { rowCount } = await pool.query("SELECT 1 FROM clients WHERE cpf = $1", [DEMO_CLIENT_CPF]);
  if (rowCount > 0) {
    console.log("Os dados de exemplo já estão no banco.");
  } else {
    await pool.query(DEMO_SQL);
    const { rows } = await pool.query(
      "SELECT (SELECT count(*) FROM clients) AS clients, (SELECT count(*) FROM reservations) AS reservations",
    );
    console.log(
      `Dados carregados: ${rows[0].clients} clientes e ${rows[0].reservations} reservas.`,
    );
  }

  const { rowCount: employeeExists } = await pool.query("SELECT 1 FROM users WHERE email = $1", [
    DEMO_EMPLOYEE_EMAIL,
  ]);
  if (!employeeExists) {
    const password = `Func-${randomBytes(4).toString("hex")}`;
    await insertUser({
      name: "Funcionário Teste",
      email: DEMO_EMPLOYEE_EMAIL,
      password,
      role: USER_ROLE.EMPLOYEE,
    });
    console.log(`Funcionário de teste: ${DEMO_EMPLOYEE_EMAIL} / ${password}`);
  }
} catch (error) {
  console.error("Erro ao carregar os dados de exemplo:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
