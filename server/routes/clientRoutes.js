import { Router } from "express";

import { isUniqueViolation } from "../db.js";
import { HTTP_STATUS, HttpError } from "../http.js";
import {
  deleteInactiveClient,
  findAllClients,
  findClientById,
  insertClient,
  updateClientActive,
} from "../repositories/clientRepository.js";
import { assertRequiredFields, parseId } from "../validation.js";

export const clientRoutes = Router();

function clientNotFound() {
  return new HttpError(HTTP_STATUS.NOT_FOUND, "Cliente não encontrado.");
}

clientRoutes.get("/", async (req, res) => {
  res.json(await findAllClients());
});

clientRoutes.post("/", async (req, res) => {
  assertRequiredFields(
    req.body,
    ["name", "cpf", "phone", "email"],
    "Todos os campos são obrigatórios.",
  );
  const { name, cpf, phone, email } = req.body;

  try {
    const client = await insertClient({ name, cpf, phone, email });
    res.status(HTTP_STATUS.CREATED).json(client);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new HttpError(HTTP_STATUS.CONFLICT, "Já existe um cliente com este CPF.");
    }
    throw error;
  }
});

clientRoutes.patch("/:id/status", async (req, res) => {
  const id = parseId(req.params.id);
  const { active } = req.body;
  if (typeof active !== "boolean") {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "O status ativo deve ser um valor booleano.");
  }

  const client = await updateClientActive(id, active);
  if (!client) throw clientNotFound();

  res.json(client);
});

clientRoutes.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);

  const deletedClient = await deleteInactiveClient(id);
  if (deletedClient) return res.json(deletedClient);

  if (!(await findClientById(id))) throw clientNotFound();
  throw new HttpError(
    HTTP_STATUS.FORBIDDEN,
    "Não é possível excluir um cliente ativo. Inative-o primeiro.",
  );
});
