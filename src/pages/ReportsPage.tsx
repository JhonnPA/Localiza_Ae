import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatCard from "../components/StatCard";
import { useYearlyReport } from "../hooks/useYearlyReport";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency } from "../utils/format";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

// a API manda o mês de 1 a 12
const formatMonth = (month: number) => MONTH_LABELS[month - 1];

// o balão do gráfico usa estilo inline, então as cores do tema vão por aqui
const TOOLTIP_STYLE = {
  backgroundColor: "rgb(var(--color-surface))",
  borderColor: "rgb(var(--color-line))",
  color: "rgb(var(--color-content))",
};

export default function ReportsPage() {
  const clients = useAppStore((state) => state.clients);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const report = useYearlyReport(year);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-link">Relatórios</h2>
          <p className="text-subtle">Análise detalhada do desempenho</p>
        </div>
        <div className="flex gap-2">
          <button className="btn border" onClick={() => setYear(year - 1)}>
            ‹
          </button>
          <div className="rounded-lg bg-surface px-3 py-2">{year}</div>
          <button className="btn border" onClick={() => setYear(year + 1)}>
            ›
          </button>
        </div>
      </div>

      {!report ? (
        <p className="text-sm text-subtle">Carregando relatório...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Receita no Ano"
              value={formatCurrency(report.totalRevenue)}
              caption="Total faturado"
            />
            <StatCard
              title="Reservas no Ano"
              value={report.reservationCount}
              caption="Reservas não canceladas"
            />
            <StatCard title="Clientes" value={clients.length} caption="Total na base" />
            <StatCard
              title="Ticket Médio"
              value={formatCurrency(report.averageTicket)}
              caption="Receita / reserva"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 font-medium">Receita Mensal</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelFormatter={formatMonth}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line type="monotone" dataKey="revenue" name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-5">
              <h3 className="mb-3 font-medium">Número de Reservas</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={formatMonth} />
                    <Bar dataKey="reservationCount" name="Reservas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
