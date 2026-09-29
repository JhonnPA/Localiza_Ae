import { formatCurrency } from "../../utils/format";

type CostSummaryProps = {
  pricePerDay: number;
  rentalDays: number;
};

export default function CostSummary({ pricePerDay, rentalDays }: CostSummaryProps) {
  if (!pricePerDay) {
    return (
      <p className="text-sm text-subtle">Selecione a categoria e as datas para ver os custos.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted">
        <span>Diária da categoria</span>
        <b>{formatCurrency(pricePerDay)}</b>
      </div>
      <div className="flex justify-between text-sm text-muted">
        <span>Total de diárias</span>
        <b>{rentalDays > 0 ? rentalDays : "-"}</b>
      </div>
      {rentalDays > 0 && (
        <>
          <hr className="my-1" />
          <div className="flex justify-between text-lg font-bold text-link">
            <span>Valor Total</span>
            <b>{formatCurrency(pricePerDay * rentalDays)}</b>
          </div>
        </>
      )}
    </div>
  );
}
