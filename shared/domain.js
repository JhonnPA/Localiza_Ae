// Termos do negócio usados tanto no server/ quanto no src/.
// Os valores são os mesmos que ficam salvos no banco.

export const USER_ROLE = /** @type {const} */ ({
  MANAGER: "gerente",
  EMPLOYEE: "funcionario",
});

export const RESERVATION_STATUS = /** @type {const} */ ({
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
});

export const MIN_PASSWORD_LENGTH = 8;

export const RENTAL_LOCATIONS = /** @type {const} */ (["Matriz", "Aeroporto", "Centro"]);

const pad = (value) => String(value).padStart(2, "0");

// data de hoje no formato do banco (AAAA-MM-DD), no fuso da máquina
export function toIsoDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * O cliente já retirou (ou já pode ter retirado) o carro?
 * No dia da retirada sem horário marcado, conta como retirado pra não arriscar.
 * @param {{ pickupDate: string, pickupTime: string | null }} reservation
 */
export function hasPickupStarted(reservation, now = new Date()) {
  const today = toIsoDate(now);
  if (reservation.pickupDate !== today) return reservation.pickupDate < today;
  if (!reservation.pickupTime) return true;

  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return reservation.pickupTime.slice(0, 5) <= currentTime;
}

/** @param {{ status: string, pickupDate: string, pickupTime: string | null }} reservation */
export function canCancelReservation(reservation, now = new Date()) {
  return reservation.status === RESERVATION_STATUS.ACTIVE && !hasPickupStarted(reservation, now);
}

/** @param {{ status: string, pickupDate: string, pickupTime: string | null }} reservation */
export function canCompleteReservation(reservation, now = new Date()) {
  return reservation.status === RESERVATION_STATUS.ACTIVE && hasPickupStarted(reservation, now);
}
