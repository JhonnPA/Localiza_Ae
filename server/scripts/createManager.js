// O banco começa sem nenhum usuário, então o primeiro gerente é criado por aqui.
// Uso: npm run create-manager -- <email> "<nome>"
// A senha é pedida depois, sem aparecer na tela. No comando ela ficaria salva no
// histórico do terminal e visível na lista de processos.
import { USER_ROLE } from "../../shared/domain.js";
import { isUniqueViolation, pool } from "../db.js";
import { insertUser } from "../repositories/userRepository.js";
import { assertValidPassword } from "../validation.js";
import { createPasswordPrompt } from "./promptPassword.js";

const USAGE = 'Uso: npm run create-manager -- <email> "<nome>"';
const [email, name, passwordInCommand] = process.argv.slice(2);
const prompt = createPasswordPrompt();

try {
  if (!email || !name) throw new Error(USAGE);
  if (passwordInCommand) {
    throw new Error(
      `Não passe a senha no comando, ela fica salva no histórico do terminal.\n${USAGE}\n` +
        "(a senha vai ser pedida em seguida)",
    );
  }

  const password = await prompt.ask("Senha do gerente: ");
  assertValidPassword(password);
  if ((await prompt.ask("Confirme a senha: ")) !== password) {
    throw new Error("As senhas não conferem.");
  }

  await insertUser({ name, email, password, role: USER_ROLE.MANAGER });
  console.log(`Gerente ${email} criado com sucesso.`);
} catch (error) {
  console.error(
    isUniqueViolation(error) ? `Já existe um usuário com o email ${email}.` : error.message,
  );
  process.exitCode = 1;
} finally {
  prompt.close();
  await pool.end();
}
