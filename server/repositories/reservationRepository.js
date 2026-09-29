import { RESERVATION_STATUS } from "../../shared/domain.js";
import { pool } from "../db.js";

function toReservation(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    categoryId: row.category_id,
    pickupDate: row.pickup_date,
    returnDate: row.return_date,
    pickupTime: row.pickup_time,
    returnTime: row.return_time,
    pickupLocation: row.pickup_location,
    returnLocation: row.return_location,
    status: row.status,
  };
}

export async function findAllReservations() {
  const { rows } = await pool.query("SELECT * FROM reservations ORDER BY pickup_date DESC");
  return rows.map(toReservation);
}

export async function insertReservation(reservation) {
  const { rows } = await pool.query(
    `INSERT INTO reservations (
       client_id, category_id, pickup_date, return_date, pickup_time,
       return_time, pickup_location, return_location, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      reservation.clientId,
      reservation.categoryId,
      reservation.pickupDate,
      reservation.returnDate,
      reservation.pickupTime || null,
      reservation.returnTime || null,
      reservation.pickupLocation,
      reservation.returnLocation,
      RESERVATION_STATUS.ACTIVE,
    ],
  );
  return toReservation(rows[0]);
}

export async function findReservationById(id) {
  const { rows } = await pool.query("SELECT * FROM reservations WHERE id = $1", [id]);
  return rows[0] ? toReservation(rows[0]) : null;
}

// só mexe se ainda estiver ativa: se duas pessoas clicarem ao mesmo tempo
// (uma cancelando e outra concluindo), só a primeira vale
export async function closeActiveReservation(id, newStatus) {
  const { rows } = await pool.query(
    "UPDATE reservations SET status = $1 WHERE id = $2 AND status = $3 RETURNING *",
    [newStatus, id, RESERVATION_STATUS.ACTIVE],
  );
  return rows[0] ? toReservation(rows[0]) : null;
}
