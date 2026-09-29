import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { USER_ROLE, type UserAccount } from "../../domain/types";
import { useUserAccounts } from "../../hooks/useUserAccounts";
import { ROUTES } from "../../routes";
import { useAppStore } from "../../store/useAppStore";
import TemporaryPasswordModal from "./TemporaryPasswordModal";

type ResetResult = { employeeName: string; password: string };

export default function EmployeesPage() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.user);
  const showToast = useAppStore((state) => state.showToast);
  const { accounts, setActive, resetPassword } = useUserAccounts();
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);

  const toggleActive = async (account: UserAccount) => {
    const action = account.active ? "desativar" : "reativar";
    const warning = account.active ? " Ele perde o acesso na hora." : "";
    if (!window.confirm(`Deseja ${action} o acesso de ${account.name}?${warning}`)) return;

    try {
      await setActive(account, !account.active);
      showToast(`Acesso ${account.active ? "desativado" : "reativado"}.`, "success");
    } catch (error) {
      showToast(`Erro ao ${action} acesso: ${(error as Error).message}`, "error");
    }
  };

  const handleResetPassword = async (account: UserAccount) => {
    const question = `Gerar uma senha provisória para ${account.name}? A senha atual deixa de funcionar.`;
    if (!window.confirm(question)) return;

    try {
      const password = await resetPassword(account);
      setResetResult({ employeeName: account.name, password });
    } catch (error) {
      showToast(`Erro ao redefinir senha: ${(error as Error).message}`, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-link">Funcionários</h2>
          <p className="text-subtle">Acessos ao sistema</p>
        </div>
        <button onClick={() => navigate(ROUTES.NEW_EMPLOYEE)} className="btn btn-accent">
          Novo Funcionário
        </button>
      </div>

      <div className="card overflow-auto p-5">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const isCurrentUser = account.id === currentUser?.id;
              // gerentes (inclusive você) não são gerenciados por aqui
              const canManage = account.role === USER_ROLE.EMPLOYEE;
              return (
                <tr key={account.id} className="border-t">
                  <td className="px-4 py-3">
                    {account.name}
                    {isCurrentUser && <span className="text-subtle"> (você)</span>}
                  </td>
                  <td className="px-4 py-3">{account.email}</td>
                  <td className="px-4 py-3">
                    {account.role === USER_ROLE.MANAGER ? "Gerente" : "Funcionário"}
                  </td>
                  <td className="space-x-1 px-4 py-3">
                    <span className={`badge ${account.active ? "badge-success" : "badge-danger"}`}>
                      {account.active ? "Ativo" : "Desativado"}
                    </span>
                    {account.mustChangePassword && (
                      <span className="badge badge-muted">Senha provisória</span>
                    )}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3">
                    {canManage && (
                      <>
                        <button
                          onClick={() => toggleActive(account)}
                          className={`link ${
                            account.active
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {account.active ? "Desativar" : "Reativar"}
                        </button>
                        <button onClick={() => handleResetPassword(account)} className="link">
                          Redefinir senha
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TemporaryPasswordModal
        employeeName={resetResult?.employeeName ?? ""}
        password={resetResult?.password ?? null}
        onClose={() => setResetResult(null)}
      />
    </div>
  );
}
