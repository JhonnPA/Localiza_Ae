import { Router } from "express";

import { HTTP_STATUS, HttpError } from "../http.js";
import { loginRateLimiter } from "../middlewares/loginRateLimiter.js";
import { findUserByCredentials } from "../repositories/userRepository.js";
import { createSession } from "../session.js";
import { assertRequiredFields } from "../validation.js";

export const authRoutes = Router();

authRoutes.post("/login", loginRateLimiter, async (req, res) => {
  assertRequiredFields(req.body, ["email", "password"], "Email e senha são obrigatórios.");
  const { email, password } = req.body;

  const user = await findUserByCredentials(String(email), String(password));
  if (!user) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Email ou senha inválidos.");
  }
  if (!user.active) {
    throw new HttpError(HTTP_STATUS.FORBIDDEN, "Seu acesso foi desativado. Fale com o gerente.");
  }

  res.json(createSession(user));
});
