import { useEffect, useState } from "react";

import { reportsApi } from "../api/localizaApi";
import type { YearlyReport } from "../domain/types";
import { useAppStore } from "../store/useAppStore";

// Relatório do ano (só gerente). Fica null enquanto carrega ou se der erro.
export function useYearlyReport(year: number): YearlyReport | null {
  const showToast = useAppStore((state) => state.showToast);
  const [report, setReport] = useState<YearlyReport | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    reportsApi
      .yearly(year)
      .then((loadedReport) => {
        if (isCurrentRequest) setReport(loadedReport);
      })
      .catch((error: Error) => {
        if (isCurrentRequest) showToast(`Erro ao carregar relatório: ${error.message}`, "error");
      });

    // se o ano mudar ou a tela fechar antes da resposta chegar, descarta
    return () => {
      isCurrentRequest = false;
    };
  }, [year, showToast]);

  return report;
}
