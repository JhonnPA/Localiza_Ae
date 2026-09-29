import { RESERVATION_STATUS } from "../../shared/domain.js";
import { pool } from "../db.js";

const MONTHS_IN_YEAR = 12;

// Receita e nº de reservas por mês (pela data de retirada) no ano pedido.
// Canceladas ficam de fora. O + 1 é porque o dia da devolução também é cobrado.
export async function findYearlyReport(year) {
  const { rows } = await pool.query(
    `SELECT EXTRACT(MONTH FROM r.pickup_date)::int AS month,
            COUNT(*)::int AS reservation_count,
            SUM((r.return_date - r.pickup_date + 1) * c.price_per_day)::float AS revenue
       FROM reservations r
       JOIN categories c ON c.id = r.category_id
      WHERE r.status <> $1
        AND EXTRACT(YEAR FROM r.pickup_date) = $2
      GROUP BY 1`,
    [RESERVATION_STATUS.CANCELED, year],
  );

  const byMonth = Array.from({ length: MONTHS_IN_YEAR }, (_, index) => {
    const row = rows.find(({ month }) => month === index + 1);
    return {
      month: index + 1,
      revenue: row?.revenue ?? 0,
      reservationCount: row?.reservation_count ?? 0,
    };
  });
  const totalRevenue = byMonth.reduce((total, { revenue }) => total + revenue, 0);
  const reservationCount = byMonth.reduce((total, month) => total + month.reservationCount, 0);

  return {
    year,
    totalRevenue,
    reservationCount,
    averageTicket: reservationCount > 0 ? totalRevenue / reservationCount : 0,
    byMonth,
  };
}
