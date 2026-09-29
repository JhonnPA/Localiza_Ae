import "dotenv/config";

const DEFAULT_API_PORT = 3001;
const DEFAULT_JWT_EXPIRES_IN = "8h";
const MIN_JWT_SECRET_LENGTH = 32;
const EXAMPLE_JWT_SECRET = "troque-por-um-valor-aleatorio";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida. Veja o arquivo .env.example.`);
  }
  return value;
}

// com segredo curto (ou o do .env.example) dá pra forjar token de gerente
function requireJwtSecret() {
  const secret = requireEnv("JWT_SECRET");
  if (secret === EXAMPLE_JWT_SECRET || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET inseguro: use um valor aleatório com ${MIN_JWT_SECRET_LENGTH}+ caracteres.`,
    );
  }
  return secret;
}

export const config = {
  apiPort: Number(process.env.API_PORT ?? DEFAULT_API_PORT),
  jwtSecret: requireJwtSecret(),
  jwtAlgorithm: "HS256",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN,
  database: {
    host: requireEnv("PGHOST"),
    port: Number(requireEnv("PGPORT")),
    database: requireEnv("PGDATABASE"),
    user: requireEnv("PGUSER"),
    password: requireEnv("PGPASSWORD"),
    // SSL só pra banco na nuvem (Render etc.), o local não precisa
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  },
};
