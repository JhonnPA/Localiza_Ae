import dayjs from "dayjs";
import { Boxes, Car, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ReservationStatus from "../components/ReservationStatus";
import StatCard from "../components/StatCard";
import { countAvailableCars } from "../domain/inventory";
import { calculateReservationCost, findCategory, isActive } from "../domain/reservation";
import { isManager } from "../domain/types";
import { useYearlyReport } from "../hooks/useYearlyReport";
import { ROUTES } from "../routes";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency, formatDate } from "../utils/format";

const RECENT_RESERVATIONS_LIMIT = 3;

// separado pra só montar na tela do gerente, assim o funcionário nem chama a rota de relatório
function RevenueThisMonthCard() {
  const today = dayjs();
  const report = useYearlyReport(today.year());
  // no dayjs o mês vai de 0 a 11, no relatório de 1 a 12
  const revenue = report?.byMonth.find(({ month }) => month === today.month() + 1)?.revenue;

  return (
    <StatCard
      title="Receita do Mês"
      value={revenue === undefined ? "..." : formatCurrency(revenue)}
      caption="Reservas não canceladas"
      icon={<DollarSign />}
    />
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const categories = useAppStore((state) => state.categories);
  const clients = useAppStore((state) => state.clients);
  const reservations = useAppStore((state) => state.reservations);

  const userIsManager = isManager(user);
  const activeReservationCount = reservations.filter(isActive).length;
  const activeClientCount = clients.filter((client) => client.active).length;
  const availableCarCount = countAvailableCars(categories, reservations);
  // a API já manda ordenado pela retirada, da mais recente pra mais antiga
  const recentReservations = reservations.slice(0, RECENT_RESERVATIONS_LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-link">Bem-vindo ao Localiza-ae</h2>
          <p className="text-subtle">Sistema completo de aluguel de carros para funcionários</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(ROUTES.NEW_RESERVATION)} className="btn btn-accent">
            Nova Reserva
          </button>
          <button onClick={() => navigate(ROUTES.CALENDAR)} className="btn btn-primary">
            Ver Calendário
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${userIsManager ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <StatCard
          title="Reservas Ativas"
          value={activeReservationCount}
          caption="Em andamento"
          icon={<Boxes />}
        />
        <StatCard
          title="Clientes Ativos"
          value={activeClientCount}
          caption="Cadastros ativos"
          icon={<Users />}
        />
        {userIsManager && <RevenueThisMonthCard />}
        <StatCard
          title="Carros Disponíveis"
          value={availableCarCount}
          caption="Disponíveis para aluguel"
          icon={<Car />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-medium">Reservas Recentes</h3>
          {recentReservations.length === 0 && (
            <p className="text-sm text-subtle">Sem reservas ainda.</p>
          )}
          <ul className="space-y-3">
            {recentReservations.map((reservation) => {
              const client = clients.find(({ id }) => id === reservation.clientId);
              const category = findCategory(categories, reservation.categoryId);
              const cost = calculateReservationCost(reservation, categories);

              return (
                <li
                  key={reservation.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{client?.name}</div>
                    <div className="text-xs text-subtle">
                      {category?.name} - {formatDate(reservation.pickupDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cost > 0 && <b className="text-sm text-link">{formatCurrency(cost)}</b>}
                    <ReservationStatus reservation={reservation} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-medium">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate(ROUTES.NEW_RESERVATION)} className="btn btn-accent">
              Nova Reserva
            </button>
            <button onClick={() => navigate(ROUTES.CLIENTS)} className="btn border">
              Buscar Cliente
            </button>
            <button onClick={() => navigate(ROUTES.CATEGORIES)} className="btn border">
              Categorias
            </button>
            {userIsManager && (
              <button onClick={() => navigate(ROUTES.REPORTS)} className="btn border">
                Relatórios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
