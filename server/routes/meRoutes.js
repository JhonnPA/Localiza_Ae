import { Router } from "express";

import { HTTP_STATUS, HttpError } from "../http.js";
import { passwordChangeRateLimiter } from "../middlewares/passwordChangeRateLimiter.js";
import { isCurrentPassword, updatePassword } from "../repositories/userRepository.js";
import { createSession } from "../session.js";
import { assertRequiredFields, assertValidPassword } from "../validation.js";

// rotas do próprio usuário logado
export const meRoutes = Router();

meRoutes.post("/password", passwordChangeRateLimiter, async (req, res) => {
  assertRequiredFields(
    req.body,
    ["currentPassword", "newPassword"],
    "Informe a senha atual e a nova senha.",
  );
  const { currentPassword, newPassword } = req.body;
  assertValidPassword(newPassword);

  if (!(await isCurrentPassword(req.user.id, String(currentPassword)))) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "A senha atual está incorreta.");
  }
  if (newPassword === currentPassword) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "A nova senha tem que ser diferente da atual.");
  }

  const user = await updatePassword(req.user.id, newPassword, { mustChangePassword: false });
  // devolve um token novo, porque o antigo ainda diz que a senha precisa ser trocada
  res.json(createSession(user));
});
