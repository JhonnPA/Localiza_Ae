import type { Reservation } from "../domain/types";
import { useAppStore } from "../store/useAppStore";

export function useReservationActions() {
  const completeReservation = useAppStore((state) => state.completeReservation);
  const cancelReservation = useAppStore((state) => state.cancelReservation);
  const showToast = useAppStore((state) => state.showToast);

  async function complete(reservation: Reservation) {
    if (!window.confirm("O carro foi devolvido? A reserva vai ser marcada como concluída.")) return;

    try {
      await completeReservation(reservation.id);
      showToast("Reserva concluída.", "success");
    } catch (error) {
      showToast(`Erro ao concluir reserva: ${(error as Error).message}`, "error");
    }
  }

  async function cancel(reservation: Reservation) {
    if (!window.confirm("Cancelar esta reserva? Não dá pra desfazer depois.")) return;

    try {
      await cancelReservation(reservation.id);
      showToast("Reserva cancelada.", "success");
    } catch (error) {
      showToast(`Erro ao cancelar reserva: ${(error as Error).message}`, "error");
    }
  }

  return { complete, cancel };
}
