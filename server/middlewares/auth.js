import jwt from "jsonwebtoken";

import { USER_ROLE } from "../../shared/domain.js";
import { config } from "../config.js";
import { HTTP_STATUS, HttpError } from "../http.js";
import { findUserById } from "../repositories/userRepository.js";

const BEARER_PREFIX = "Bearer ";

function readTokenPayload(req) {
  const authorization = req.headers.authorization ?? "";
  if (!authorization.startsWith(BEARER_PREFIX)) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Token de autenticação não fornecido.");
  }

  const token = authorization.slice(BEARER_PREFIX.length);
  try {
    return jwt.verify(token, config.jwtSecret, { algorithms: [config.jwtAlgorithm] });
  } catch {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Token inválido ou expirado.");
  }
}

// Busca o usuário no banco a cada requisição, pra desativação valer na hora
// (sem esperar o token de 8h expirar). Se a versão da sessão (ver) não bater,
// é token de antes de uma troca de senha e cai também.
export async function requireAuth(req, res, next) {
  const { id, ver } = readTokenPayload(req);
  const user = await findUserById(id);
  if (!user?.active) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Seu acesso foi desativado.");
  }
  if (ver !== user.tokenVersion) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Sua sessão foi encerrada. Entre novamente.");
  }

  req.user = user;
  next();
}

// com senha provisória só dá pra usar /api/me, que é onde troca a senha
export function requirePasswordUpToDate(req, res, next) {
  if (req.user.mustChangePassword) {
    throw new HttpError(HTTP_STATUS.FORBIDDEN, "Troque sua senha antes de continuar.");
  }
  next();
}

export function requireManager(req, res, next) {
  if (req.user.role !== USER_ROLE.MANAGER) {
    throw new HttpError(
      HTTP_STATUS.FORBIDDEN,
      "Acesso negado: privilégios de gerente necessários.",
    );
  }
  next();
}
