import dayjs from "dayjs";

const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  return dayjs(isoDate).format(DISPLAY_DATE_FORMAT);
}
