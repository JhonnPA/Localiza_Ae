import { useState } from "react";

import StatCard from "../../components/StatCard";
import { matchesSearch } from "../../domain/client";
import { isActive } from "../../domain/reservation";
import type { Client } from "../../domain/types";
import { useAppStore } from "../../store/useAppStore";
import ClientDetailsModal from "./ClientDetailsModal";

export default function ClientsPage() {
  const clients = useAppStore((state) => state.clients);
  const reservations = useAppStore((state) => state.reservations);
  const updateClientStatus = useAppStore((state) => state.updateClientStatus);
  const deleteClient = useAppStore((state) => state.deleteClient);
  const showToast = useAppStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState("");
  const [detailsClientId, setDetailsClientId] = useState<number | null>(null);

  const matchingClients = clients.filter((client) => matchesSearch(client, searchTerm));
  const detailsClient = clients.find((client) => client.id === detailsClientId);
  const clientIdsWithActiveReservation = new Set(
    reservations.filter(isActive).map((reservation) => reservation.clientId),
  );
  const averageReservationsPerClient =
    clients.length > 0 ? (reservations.length / clients.length).toFixed(1) : "0";

  const toggleClientStatus = async (client: Client) => {
    const action = client.active ? "inativar" : "ativar";
    if (!window.confirm(`Deseja ${action} o cliente ${client.name}?`)) return;

    try {
      await updateClientStatus(client.id, !client.active);
      showToast(`Cliente ${client.active ? "inativado" : "ativado"} com sucesso.`, "success");
    } catch (error) {
      showToast(`Erro ao ${action} cliente: ${(error as Error).message}`, "error");
    }
  };

  const removeClient = async (client: Client) => {
    const question = `Deseja excluir ${client.name}? Esta ação não pode ser desfeita.`;
    if (!window.confirm(question)) return;

    try {
      await deleteClient(client.id);
      showToast("Cliente excluído com sucesso.", "success");
    } catch (error) {
      showToast(`Erro ao excluir cliente: ${(error as Error).message}`, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-link">Clientes</h2>
        <p className="text-subtle">Busque e visualize informações</p>
      </div>

      <div className="card p-5">
        <input
          className="input mb-4"
          placeholder="Digite nome, CPF, telefone ou email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reserva Ativa?</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {matchingClients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.cpf}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${client.active ? "badge-success" : "badge-muted"}`}>
                      {client.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {clientIdsWithActiveReservation.has(client.id) ? (
                      <span className="badge badge-success">Sim</span>
                    ) : (
                      <span className="text-subtle">Não</span>
                    )}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3">
                    <button onClick={() => setDetailsClientId(client.id)} className="link">
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => toggleClientStatus(client)}
                      className={`link ${client.active ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
                    >
                      {client.active ? "Inativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => removeClient(client)}
                      className="link text-red-600 dark:text-red-400"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <StatCard title="Total de Clientes" value={clients.length} />
        <StatCard
          title="Clientes Ativos"
          value={clients.filter((client) => client.active).length}
        />
        <StatCard title="Com Reserva Ativa" value={clientIdsWithActiveReservation.size} />
        <StatCard title="Média de Reservas" value={averageReservationsPerClient} />
      </div>

      <ClientDetailsModal client={detailsClient} onClose={() => setDetailsClientId(null)} />
    </div>
  );
}
