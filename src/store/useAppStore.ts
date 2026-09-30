import { create } from "zustand";

import { ApiError, setSessionEndedHandler } from "../api/httpClient";
import {
  authApi,
  categoriesApi,
  clientsApi,
  meApi,
  reservationsApi,
  usersApi,
} from "../api/localizaApi";
import { clearSessionToken, getSessionUser, saveSessionToken } from "../api/session";
import type {
  Category,
  Client,
  NewClient,
  NewEmployee,
  NewReservation,
  Reservation,
  User,
} from "../domain/types";

export type ToastType = "success" | "error" | "info";
export type Toast = { message: string; type: ToastType };

type AppState = {
  user: User | null;
  categories: Category[];
  clients: Client[];
  reservations: Reservation[];
  selectedCategoryId?: number;
  toast: Toast | null;

  showToast(message: string, type?: ToastType): void;
  dismissToast(): void;
  selectCategory(categoryId?: number): void;

  login(email: string, password: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  logout(): void;
  loadData(): Promise<void>;

  createReservation(reservation: NewReservation): Promise<void>;
  completeReservation(id: number): Promise<void>;
  cancelReservation(id: number): Promise<void>;
  createClient(client: NewClient): Promise<Client>;
  updateClientStatus(id: number, active: boolean): Promise<void>;
  deleteClient(id: number): Promise<void>;
  registerEmployee(employee: NewEmployee): Promise<void>;
};

const emptyData = {
  categories: [],
  clients: [],
  reservations: [],
  selectedCategoryId: undefined,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...emptyData,
  user: getSessionUser(),
  toast: null,

  showToast(message, type = "info") {
    set({ toast: { message, type } });
  },

  dismissToast() {
    set({ toast: null });
  },

  selectCategory(categoryId) {
    set({ selectedCategoryId: categoryId });
  },

  async login(email, password) {
    const session = await authApi.login(email, password);
    saveSessionToken(session.token);
    set({ user: session.user });
  },

  // a API devolve um token novo (o antigo ainda marcava a senha como provisória)
  async changePassword(currentPassword, newPassword) {
    const session = await meApi.changePassword(currentPassword, newPassword);
    saveSessionToken(session.token);
    set({ user: session.user });
  },

  logout() {
    clearSessionToken();
    set({ ...emptyData, user: null });
  },

  async loadData() {
    const user = get().user;
    // com senha provisória a API recusa tudo até a senha ser trocada
    if (!user || user.mustChangePassword) return;

    try {
      const [categories, clients, reservations] = await Promise.all([
        categoriesApi.list(),
        clientsApi.list(),
        reservationsApi.list(),
      ]);
      set({ categories, clients, reservations });
    } catch (error) {
      if (error instanceof ApiError && error.isSessionError) {
        get().logout();
        return;
      }
      get().showToast("Não foi possível carregar os dados. Tente novamente.", "error");
    }
  },

  async createReservation(newReservation) {
    const reservation = await reservationsApi.create(newReservation);
    set((state) => ({ reservations: [reservation, ...state.reservations] }));
  },

  async completeReservation(id) {
    replaceReservation(await reservationsApi.complete(id));
  },

  async cancelReservation(id) {
    replaceReservation(await reservationsApi.cancel(id));
  },

  async createClient(newClient) {
    const client = await clientsApi.create(newClient);
    set((state) => ({ clients: [...state.clients, client] }));
    return client;
  },

  async updateClientStatus(id, active) {
    const updated = await clientsApi.updateStatus(id, active);
    set((state) => ({
      clients: state.clients.map((client) => (client.id === id ? updated : client)),
    }));
  },

  async deleteClient(id) {
    await clientsApi.remove(id);
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
      reservations: state.reservations.filter((reservation) => reservation.clientId !== id),
    }));
  },

  async registerEmployee(employee) {
    await usersApi.createEmployee(employee);
  },
}));

function replaceReservation(updated: Reservation) {
  useAppStore.setState((state) => ({
    reservations: state.reservations.map((reservation) =>
      reservation.id === updated.id ? updated : reservation,
    ),
  }));
}

setSessionEndedHandler(() => useAppStore.getState().logout());
