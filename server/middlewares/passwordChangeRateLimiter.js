import { rateLimit } from "express-rate-limit";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

// Quem tem um token roubado podia chutar a senha atual até acertar e trocar a
// senha do dono. Roda depois do requireAuth, por isso dá pra contar por usuário.
export const passwordChangeRateLimiter = rateLimit({
  windowMs: WINDOW_MINUTES * 60 * 1000,
  limit: MAX_ATTEMPTS,
  keyGenerator: (req) => `user:${req.user.id}`,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: `Muitas tentativas. Tente de novo em ${WINDOW_MINUTES} minutos.` },
});
