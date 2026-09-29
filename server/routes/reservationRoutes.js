import { Router } from "express";

import {
  RESERVATION_STATUS,
  canCancelReservation,
  canCompleteReservation,
  toIsoDate,
} from "../../shared/domain.js";
import { isForeignKeyViolation } from "../db.js";
import { HTTP_STATUS, HttpError } from "../http.js";
import {
  closeActiveReservation,
  findAllReservations,
  findReservationById,
  insertReservation,
} from "../repositories/reservationRepository.js";
import { assertIsoDate, assertRequiredFields, parseId } from "../validation.js";

export const reservationRoutes = Router();

reservationRoutes.get("/", async (req, res) => {
  res.json(await findAllReservations());
});

reservationRoutes.post("/", async (req, res) => {
  assertRequiredFields(
    req.body,
    ["clientId", "categoryId", "pickupDate", "returnDate"],
    "Cliente, categoria e datas são obrigatórios.",
  );
  const { pickupDate, returnDate } = req.body;
  assertIsoDate(pickupDate);
  assertIsoDate(returnDate);
  if (pickupDate < toIsoDate()) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "A data de retirada não pode estar no passado.");
  }
  if (returnDate < pickupDate) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "A data de devolução não pode ser anterior à retirada.",
    );
  }

  try {
    const reservation = await insertReservation(req.body);
    res.status(HTTP_STATUS.CREATED).json(reservation);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, "Cliente ou categoria não encontrado.");
    }
    throw error;
  }
});

async function findActiveReservation(rawId) {
  const reservation = await findReservationById(parseId(rawId));
  if (!reservation) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Reserva não encontrada.");
  }
  if (reservation.status !== RESERVATION_STATUS.ACTIVE) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      `Esta reserva já está ${reservation.status.toLowerCase()}.`,
    );
  }
  return reservation;
}

async function closeReservation(reservation, newStatus) {
  const updated = await closeActiveReservation(reservation.id, newStatus);
  // alguém mudou o status entre a leitura e o update
  if (!updated) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "A reserva foi alterada por outra pessoa. Atualize a página.",
    );
  }
  return updated;
}

reservationRoutes.post("/:id/cancel", async (req, res) => {
  const reservation = await findActiveReservation(req.params.id);
  if (!canCancelReservation(reservation)) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "Não dá pra cancelar: o cliente já retirou o carro. Conclua a reserva na devolução.",
    );
  }
  res.json(await closeReservation(reservation, RESERVATION_STATUS.CANCELED));
});

reservationRoutes.post("/:id/complete", async (req, res) => {
  const reservation = await findActiveReservation(req.params.id);
  if (!canCompleteReservation(reservation)) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "Não dá pra concluir: o carro ainda não foi retirado. Se o cliente desistiu, cancele a reserva.",
    );
  }
  res.json(await closeReservation(reservation, RESERVATION_STATUS.COMPLETED));
});
