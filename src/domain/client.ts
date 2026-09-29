import type { Client } from "./types";

export const CPF_DIGIT_COUNT = 11;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function findClientByCpf(clients: Client[], cpf: string): Client | undefined {
  const cpfDigits = onlyDigits(cpf);
  if (!cpfDigits) return undefined;
  return clients.find((client) => onlyDigits(client.cpf) === cpfDigits);
}

export function matchesSearch(client: Client, searchTerm: string): boolean {
  const normalizedTerm = searchTerm.toLowerCase();
  return [client.name, client.cpf, client.phone, client.email].some((field) =>
    field.toLowerCase().includes(normalizedTerm),
  );
}
