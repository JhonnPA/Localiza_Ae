import { canCancelReservation, canCompleteReservation } from "../domain/reservation";
import {
  RESERVATION_STATUS,
  type Reservation,
  type ReservationStatus as Status,
} from "../domain/types";
import { useReservationActions } from "../hooks/useReservationActions";

const BADGE_BY_STATUS: Record<Status, string> = {
  [RESERVATION_STATUS.ACTIVE]: "badge-success",
  [RESERVATION_STATUS.COMPLETED]: "badge-muted",
  [RESERVATION_STATUS.CANCELED]: "badge-danger",
};

// badge do status + Concluir (carro já retirado) ou Cancelar (ainda não retirado)
export default function ReservationStatus({ reservation }: { reservation: Reservation }) {
  const { complete, cancel } = useReservationActions();

  return (
    <div className="flex items-center gap-2">
      <span className={`badge ${BADGE_BY_STATUS[reservation.status]}`}>{reservation.status}</span>
      {canCompleteReservation(reservation) && (
        <button onClick={() => complete(reservation)} className="link text-xs">
          Concluir
        </button>
      )}
      {canCancelReservation(reservation) && (
        <button
          onClick={() => cancel(reservation)}
          className="link text-xs text-red-600 dark:text-red-400"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
