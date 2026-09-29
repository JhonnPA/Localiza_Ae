import { getSessionToken } from "./session";

const API_BASE_PATH = "/api";
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }

  get isSessionError(): boolean {
    return this.status === HTTP_UNAUTHORIZED || this.status === HTTP_FORBIDDEN;
  }
}

let onSessionEnded = () => {};

// o store registra o logout aqui: se qualquer requisição voltar 401 (ex.: acesso
// desativado pelo gerente), a pessoa volta pro login na hora
export function setSessionEndedHandler(handler: () => void) {
  onSessionEnded = handler;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function apiRequest<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_PATH}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (response.status === HTTP_UNAUTHORIZED && token) {
    onSessionEnded();
  }
  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? "Erro ao comunicar com o servidor.");
  }
  return data as T;
}
