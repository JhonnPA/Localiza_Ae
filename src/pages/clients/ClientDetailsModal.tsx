import dayjs from "dayjs";

import Modal from "../../components/Modal";
import ReservationStatus from "../../components/ReservationStatus";
import { calculateReservationCost, findCategory } from "../../domain/reservation";
import type { Client } from "../../domain/types";
import { useAppStore } from "../../store/useAppStore";
import { formatCurrency, formatDate } from "../../utils/format";

type ClientDetailsModalProps = {
  client: Client | undefined;
  onClose: () => void;
};

export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const reservations = useAppStore((state) => state.reservations);
  const categories = useAppStore((state) => state.categories);

  const clientReservations = reservations
    .filter((reservation) => reservation.clientId === client?.id)
    .sort((a, b) => dayjs(b.pickupDate).valueOf() - dayjs(a.pickupDate).valueOf());

  return (
    <Modal open={client !== undefined} onClose={onClose} title="Detalhes do Cliente">
      {client && (
        <div className="space-y-4">
          <div className="space-y-1 border-b pb-3 text-sm">
            <div>
              <b>Nome:</b> {client.name}
            </div>
            <div>
              <b>Email:</b> {client.email}
            </div>
            <div>
              <b>CPF:</b> {client.cpf}
            </div>
            <div>
              <b>Telefone:</b> {client.phone}
            </div>
            <div>
              <b>Status:</b> {client.active ? "Ativo" : "Inativo"}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Histórico de Reservas ({clientReservations.length})
            </h3>

            {clientReservations.length === 0 ? (
              <p className="text-sm text-subtle">Nenhuma reserva encontrada.</p>
            ) : (
              <div className="max-h-60 space-y-3 overflow-y-auto">
                {clientReservations.map((reservation) => {
                  const category = findCategory(categories, reservation.categoryId);
                  return (
                    <div
                      key={reservation.id}
                      className="flex gap-4 rounded-lg border bg-surface-muted p-3"
                    >
                      {category?.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-16 w-20 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="font-medium text-link">
                          {category?.name ?? "Indefinida"}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Retirada:</span>
                          <b>{formatDate(reservation.pickupDate)}</b>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Devolução:</span>
                          <b>{formatDate(reservation.returnDate)}</b>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-sm font-bold">
                          <ReservationStatus reservation={reservation} />
                          <span className="text-content">
                            {formatCurrency(calculateReservationCost(reservation, categories))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
