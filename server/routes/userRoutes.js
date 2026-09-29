import { randomBytes } from "node:crypto";

import { Router } from "express";

import { USER_ROLE } from "../../shared/domain.js";
import { isUniqueViolation } from "../db.js";
import { HTTP_STATUS, HttpError } from "../http.js";
import {
  findAllUsers,
  findUserById,
  insertUser,
  updatePassword,
  updateUserActive,
} from "../repositories/userRepository.js";
import { assertRequiredFields, assertValidPassword, parseId } from "../validation.js";

// Todas as rotas daqui são só do gerente (protegido no index.js)
export const userRoutes = Router();

// 9 bytes viram 12 caracteres em base64url
const TEMPORARY_PASSWORD_BYTES = 9;

function generateTemporaryPassword() {
  return randomBytes(TEMPORARY_PASSWORD_BYTES).toString("base64url");
}

// Pela tela só dá pra mexer em funcionário, então o gerente não consegue agir sobre
// si mesmo nem redefinir a senha de outro gerente pra entrar no lugar dele.
// Gerente se cria pelo npm run create-manager, direto no servidor.
async function findManageableEmployee(req) {
  const user = await findUserById(parseId(req.params.id));
  if (!user) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Usuário não encontrado.");
  }
  if (user.role !== USER_ROLE.EMPLOYEE) {
    throw new HttpError(HTTP_STATUS.FORBIDDEN, "Pela tela só dá pra gerenciar funcionários.");
  }
  return user;
}

userRoutes.get("/", async (req, res) => {
  res.json(await findAllUsers());
});

// a senha que o gerente define é provisória: o funcionário troca no primeiro login
userRoutes.post("/", async (req, res) => {
  assertRequiredFields(
    req.body,
    ["name", "email", "password"],
    "Nome, email e senha são obrigatórios.",
  );
  const { name, email, password } = req.body;
  assertValidPassword(password);

  try {
    const employee = await insertUser({
      name,
      email,
      password,
      role: USER_ROLE.EMPLOYEE,
      mustChangePassword: true,
    });
    res.status(HTTP_STATUS.CREATED).json(employee);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(HTTP_STATUS.CONFLICT, "Já existe um usuário com este email.");
    }
    throw error;
  }
});

userRoutes.patch("/:id/status", async (req, res) => {
  const { active } = req.body;
  if (typeof active !== "boolean") {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "O status ativo deve ser um valor booleano.");
  }
  const user = await findManageableEmployee(req);
  res.json(await updateUserActive(user.id, active));
});

// gera uma senha provisória e devolve uma única vez, pro gerente passar ao funcionário
userRoutes.post("/:id/reset-password", async (req, res) => {
  const user = await findManageableEmployee(req);
  const temporaryPassword = generateTemporaryPassword();
  await updatePassword(user.id, temporaryPassword, { mustChangePassword: true });
  res.json({ temporaryPassword });
});
