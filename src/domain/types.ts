import { RESERVATION_STATUS, USER_ROLE } from "../../shared/domain.js";

export {
  MIN_PASSWORD_LENGTH,
  RENTAL_LOCATIONS,
  RESERVATION_STATUS,
  USER_ROLE,
} from "../../shared/domain.js";

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
};

// usuário como aparece na tela de funcionários (só o gerente vê)
export type UserAccount = User & { active: boolean; createdAt: string };

export type Category = {
  id: number;
  name: string;
  pricePerDay: number;
  stock: number;
  features: string[];
  imageUrl: string | null;
};

export type Client = {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  active: boolean;
};

export type Reservation = {
  id: number;
  clientId: number;
  categoryId: number;
  pickupDate: string;
  returnDate: string;
  pickupTime: string | null;
  returnTime: string | null;
  pickupLocation: string;
  returnLocation: string;
  status: ReservationStatus;
};

export type NewReservation = Omit<Reservation, "id" | "status">;
export type NewClient = Omit<Client, "id" | "active">;
export type NewEmployee = { name: string; email: string; password: string };

// vem pronto da API (GET /api/reports/yearly), month vai de 1 a 12
export type YearlyReport = {
  year: number;
  totalRevenue: number;
  reservationCount: number;
  averageTicket: number;
  byMonth: { month: number; revenue: number; reservationCount: number }[];
};

export function isManager(user: User | null): boolean {
  return user?.role === USER_ROLE.MANAGER;
}
