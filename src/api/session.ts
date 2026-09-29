import type { User } from "../domain/types";

const TOKEN_STORAGE_KEY = "token";

export function getSessionToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveSessionToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// JWT = cabeçalho.dados.assinatura, os dados do usuário ficam no meio
export function getSessionUser(): User | null {
  const token = getSessionToken();
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload)) as User;
  } catch {
    return null;
  }
}
