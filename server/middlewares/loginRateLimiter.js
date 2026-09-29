import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const LOGIN_WINDOW_MINUTES = 15;
const MAX_ATTEMPTS_PER_ACCOUNT = 10;
// teto por IP somando todos os emails, contra testar uma senha comum em muitas contas
const MAX_ATTEMPTS_PER_IP = 50;

const tooManyAttempts = {
  message: `Muitas tentativas de login. Tente novamente em ${LOGIN_WINDOW_MINUTES} minutos.`,
};

function loginLimiter(limit, keyGenerator) {
  return rateLimit({
    windowMs: LOGIN_WINDOW_MINUTES * 60 * 1000,
    limit,
    keyGenerator,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: tooManyAttempts,
  });
}

// limita as tentativas de login contra força bruta: por conta (IP + email) e por IP.
// Se for pra produção atrás de proxy, precisa do app.set("trust proxy", 1).
export const loginRateLimiter = [
  loginLimiter(MAX_ATTEMPTS_PER_IP, (req) => ipKeyGenerator(req.ip)),
  loginLimiter(
    MAX_ATTEMPTS_PER_ACCOUNT,
    (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email ?? "").toLowerCase()}`,
  ),
];
