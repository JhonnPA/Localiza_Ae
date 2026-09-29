import type {
  Category,
  Client,
  NewClient,
  NewEmployee,
  NewReservation,
  Reservation,
  User,
  UserAccount,
  YearlyReport,
} from "../domain/types";
import { apiRequest } from "./httpClient";

type Session = { token: string; user: User };

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<Session>("POST", "/login", { email, password }),
};

export const meApi = {
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<Session>("POST", "/me/password", { currentPassword, newPassword }),
};

// só gerente
export const usersApi = {
  list: () => apiRequest<UserAccount[]>("GET", "/users"),
  createEmployee: (employee: NewEmployee) => apiRequest<UserAccount>("POST", "/users", employee),
  updateStatus: (id: number, active: boolean) =>
    apiRequest<UserAccount>("PATCH", `/users/${id}/status`, { active }),
  resetPassword: (id: number) =>
    apiRequest<{ temporaryPassword: string }>("POST", `/users/${id}/reset-password`),
};

export const categoriesApi = {
  list: () => apiRequest<Category[]>("GET", "/categories"),
};

export const clientsApi = {
  list: () => apiRequest<Client[]>("GET", "/clients"),
  create: (client: NewClient) => apiRequest<Client>("POST", "/clients", client),
  updateStatus: (id: number, active: boolean) =>
    apiRequest<Client>("PATCH", `/clients/${id}/status`, { active }),
  remove: (id: number) => apiRequest<Client>("DELETE", `/clients/${id}`),
};

export const reservationsApi = {
  list: () => apiRequest<Reservation[]>("GET", "/reservations"),
  create: (reservation: NewReservation) =>
    apiRequest<Reservation>("POST", "/reservations", reservation),
  complete: (id: number) => apiRequest<Reservation>("POST", `/reservations/${id}/complete`),
  cancel: (id: number) => apiRequest<Reservation>("POST", `/reservations/${id}/cancel`),
};

// só gerente, pros outros a API responde 403
export const reportsApi = {
  yearly: (year: number) => apiRequest<YearlyReport>("GET", `/reports/yearly?year=${year}`),
};
