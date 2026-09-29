import { HTTP_STATUS, HttpError } from "../http.js";

// Todo erro das rotas cai aqui, elas só dão throw.
// Tem que ter os 4 parâmetros pro Express reconhecer como handler de erro, por isso o _next.
export function errorHandler(error, req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "JSON inválido." });
  }

  console.error(`Erro em ${req.method} ${req.originalUrl}:`, error);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Erro de servidor." });
}
