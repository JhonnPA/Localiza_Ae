import dayjs from "dayjs";

import { RESERVATION_STATUS, type Category, type Reservation } from "./types";

// o dia da devolução também conta como diária (retirou e devolveu no mesmo dia = 1)
const RETURN_DAY_IS_CHARGED = 1;

export function countRentalDays(pickupDate: string, returnDate: string): number {
  const pickup = dayjs(pickupDate);
  const dropOff = dayjs(returnDate);
  if (!pickup.isValid() || !dropOff.isValid() || dropOff.isBefore(pickup, "day")) {
    return 0;
  }
  return dropOff.diff(pickup, "day") + RETURN_DAY_IS_CHARGED;
}

export function calculateReservationCost(reservation: Reservation, categories: Category[]): number {
  const category = findCategory(categories, reservation.categoryId);
  const rentalDays = countRentalDays(reservation.pickupDate, reservation.returnDate);
  return (category?.pricePerDay ?? 0) * rentalDays;
}

export function findCategory(categories: Category[], categoryId: number): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function isActive(reservation: Reservation): boolean {
  return reservation.status === RESERVATION_STATUS.ACTIVE;
}

// regras de cancelar/concluir ficam no shared/ pra API e site usarem as mesmas
export { canCancelReservation, canCompleteReservation, toIsoDate } from "../../shared/domain.js";
