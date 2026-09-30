import { useCallback, useEffect, useState } from "react";

import { usersApi } from "../api/localizaApi";
import type { UserAccount } from "../domain/types";
import { useAppStore } from "../store/useAppStore";

// Lista de acessos do sistema pra tela de funcionários (só gerente).
// Fica aqui e não no store porque só essa tela usa.
export function useUserAccounts() {
  const showToast = useAppStore((state) => state.showToast);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);

  const reload = useCallback(async () => {
    try {
      setAccounts(await usersApi.list());
    } catch (error) {
      showToast(`Erro ao carregar funcionários: ${(error as Error).message}`, "error");
    }
  }, [showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setActive = async (account: UserAccount, active: boolean) => {
    const updated = await usersApi.updateStatus(account.id, active);
    setAccounts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  const resetPassword = async (account: UserAccount) => {
    const { temporaryPassword } = await usersApi.resetPassword(account.id);
    setAccounts((current) =>
      current.map((item) =>
        item.id === account.id ? { ...item, mustChangePassword: true } : item,
      ),
    );
    return temporaryPassword;
  };

  return { accounts, setActive, resetPassword };
}
