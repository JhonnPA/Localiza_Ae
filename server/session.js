import jwt from "jsonwebtoken";

import { config } from "./config.js";

// Gera o token de login. Usado no login e depois de trocar a senha
// (o token antigo diz que a senha ainda precisa ser trocada).
export function createSession(user) {
  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
  // ver é a versão da sessão, o requireAuth recusa o token se não bater com a do banco
  const token = jwt.sign({ ...sessionUser, ver: user.tokenVersion }, config.jwtSecret, {
    algorithm: config.jwtAlgorithm,
    expiresIn: config.jwtExpiresIn,
  });
  return { token, user: sessionUser };
}
