import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { useState } from "react";

import ReservationStatus from "../components/ReservationStatus";
import { findCategory } from "../domain/reservation";
import { useAppStore } from "../store/useAppStore";
import { formatDate } from "../utils/format";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ISO_DATE_FORMAT = "YYYY-MM-DD";

function listDaysOfMonth(month: Dayjs): Dayjs[] {
  const firstDay = month.startOf("month");
  return Array.from({ length: month.daysInMonth() }, (_, index) => firstDay.add(index, "day"));
}

export default function CalendarPage() {
  const reservations = useAppStore((state) => state.reservations);
  const clients = useAppStore((state) => state.clients);
  const categories = useAppStore((state) => state.categories);

  const [visibleMonth, setVisibleMonth] = useState(() => dayjs().startOf("month"));
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);

  const daysOfMonth = listDaysOfMonth(visibleMonth);
  // espaços vazios antes do dia 1 pra ele cair no dia da semana certo
  const leadingBlankDays = visibleMonth.startOf("month").day();

  const reservationsPickedUpOn = (day: Dayjs) =>
    reservations.filter((reservation) => reservation.pickupDate === day.format(ISO_DATE_FORMAT));

  const showMonth = (month: Dayjs) => {
    setVisibleMonth(month);
    setSelectedDay(null);
  };

  const selectedDayReservations = selectedDay ? reservationsPickedUpOn(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-link">Calendário de Reservas</h2>
        <div className="flex gap-2">
          <button
            className="btn border"
            onClick={() => showMonth(visibleMonth.subtract(1, "month"))}
          >
            ‹
          </button>
          <div className="rounded-lg bg-surface px-3 py-2 capitalize">
            {visibleMonth.locale("pt-br").format("MMMM [de] YYYY")}
          </div>
          <button className="btn border" onClick={() => showMonth(visibleMonth.add(1, "month"))}>
            ›
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-xs text-subtle">
              {label}
            </div>
          ))}
          {Array.from({ length: leadingBlankDays }, (_, index) => (
            <div key={`blank-${index}`} />
          ))}
          {daysOfMonth.map((day) => {
            const reservationCount = reservationsPickedUpOn(day).length;
            const hasReservations = reservationCount > 0;
            return (
              <button
                key={day.date()}
                onClick={() => setSelectedDay(day)}
                className={`relative flex h-20 items-center justify-center rounded-lg border ${
                  hasReservations
                    ? "border-brand-yellow bg-brand-yellow/20"
                    : "bg-surface hover:bg-surface-muted"
                }`}
              >
                {day.date()}
                {hasReservations && (
                  <span className="absolute right-1 top-1 rounded bg-primary px-1 text-[10px] text-white">
                    {reservationCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-2 font-medium">
          {selectedDay
            ? `Reservas em ${formatDate(selectedDay.format(ISO_DATE_FORMAT))}`
            : "Selecione um dia"}
        </h3>
        {selectedDayReservations.length === 0 ? (
          <p className="text-sm text-subtle">Nenhuma reserva neste dia.</p>
        ) : (
          <ul className="space-y-2">
            {selectedDayReservations.map((reservation) => {
              const client = clients.find(({ id }) => id === reservation.clientId);
              const category = findCategory(categories, reservation.categoryId);
              return (
                <li
                  key={reservation.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{client?.name}</div>
                    <div className="text-xs text-subtle">
                      {category?.name} • Retirada {reservation.pickupTime ?? ""} •{" "}
                      {reservation.pickupLocation}
                    </div>
                  </div>
                  <ReservationStatus reservation={reservation} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
