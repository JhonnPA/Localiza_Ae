import { isActive } from "./reservation";
import type { Category, Reservation } from "./types";

export function countAvailableCarsByCategory(
  categories: Category[],
  reservations: Reservation[],
): Map<number, number> {
  const activeReservationsByCategory = new Map<number, number>();
  for (const reservation of reservations.filter(isActive)) {
    const current = activeReservationsByCategory.get(reservation.categoryId) ?? 0;
    activeReservationsByCategory.set(reservation.categoryId, current + 1);
  }

  return new Map(
    categories.map((category) => [
      category.id,
      category.stock - (activeReservationsByCategory.get(category.id) ?? 0),
    ]),
  );
}

export function countAvailableCars(categories: Category[], reservations: Reservation[]): number {
  const availableByCategory = countAvailableCarsByCategory(categories, reservations);
  return [...availableByCategory.values()].reduce((total, available) => total + available, 0);
}
