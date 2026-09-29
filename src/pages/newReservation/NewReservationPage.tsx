import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import FormField from "../../components/FormField";
import FormMessage, { type FormMessageData } from "../../components/FormMessage";
import { CPF_DIGIT_COUNT, findClientByCpf, onlyDigits } from "../../domain/client";
import { countRentalDays, findCategory, toIsoDate } from "../../domain/reservation";
import { RENTAL_LOCATIONS } from "../../domain/types";
import { ROUTES } from "../../routes";
import { useAppStore } from "../../store/useAppStore";
import CostSummary from "./CostSummary";
import NewClientModal from "./NewClientModal";

type ReservationForm = {
  categoryId: number | null;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  pickupLocation: string;
  returnLocation: string;
};

type TextField = Exclude<keyof ReservationForm, "categoryId">;

export default function NewReservationPage() {
  const navigate = useNavigate();
  const categories = useAppStore((state) => state.categories);
  const clients = useAppStore((state) => state.clients);
  const selectedCategoryId = useAppStore((state) => state.selectedCategoryId);
  const createReservation = useAppStore((state) => state.createReservation);
  const showToast = useAppStore((state) => state.showToast);

  const [cpf, setCpf] = useState("");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [message, setMessage] = useState<FormMessageData | null>(null);
  const [form, setForm] = useState<ReservationForm>({
    categoryId: selectedCategoryId ?? null,
    pickupDate: "",
    returnDate: "",
    pickupTime: "",
    returnTime: "",
    pickupLocation: RENTAL_LOCATIONS[0],
    returnLocation: RENTAL_LOCATIONS[0],
  });

  const client = findClientByCpf(clients, cpf);
  const canRegisterNewClient = !client && onlyDigits(cpf).length === CPF_DIGIT_COUNT;
  const pricePerDay = form.categoryId
    ? (findCategory(categories, form.categoryId)?.pricePerDay ?? 0)
    : 0;
  const rentalDays = countRentalDays(form.pickupDate, form.returnDate);
  const today = toIsoDate();

  const updateField = (field: TextField, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (form.pickupDate && form.pickupDate < today) {
      setMessage({ type: "error", text: "A data de retirada não pode estar no passado." });
      return;
    }
    if (!client || !form.categoryId || rentalDays === 0) {
      setMessage({
        type: "error",
        text: "Informe um cliente cadastrado, a categoria e datas válidas.",
      });
      return;
    }

    try {
      await createReservation({
        ...form,
        clientId: client.id,
        categoryId: form.categoryId,
        pickupTime: form.pickupTime || null,
        returnTime: form.returnTime || null,
      });
      showToast("Reserva criada com sucesso!", "success");
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      setMessage({ type: "error", text: `Falha ao criar reserva: ${(error as Error).message}` });
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-link">Nova Reserva</h2>

          <FormMessage message={message} />

          <form onSubmit={handleSubmit} className="card space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Categoria">
                <select
                  className="input"
                  value={form.categoryId ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="CPF do Cliente">
                <div className="flex gap-2">
                  <input
                    className="input"
                    placeholder="Digite o CPF..."
                    value={cpf}
                    onChange={(event) => setCpf(event.target.value)}
                  />
                  {canRegisterNewClient && (
                    <button
                      type="button"
                      onClick={() => setIsNewClientModalOpen(true)}
                      className="btn btn-primary whitespace-nowrap text-sm"
                    >
                      Novo
                    </button>
                  )}
                </div>
              </FormField>

              <FormField label="Nome do Cliente">
                <input
                  className="input bg-surface-muted"
                  placeholder="-"
                  value={client?.name ?? ""}
                  disabled
                />
              </FormField>

              <FormField label="Data de Retirada">
                <input
                  type="date"
                  className="input"
                  min={today}
                  value={form.pickupDate}
                  onChange={(event) => updateField("pickupDate", event.target.value)}
                />
              </FormField>
              <FormField label="Data de Devolução">
                <input
                  type="date"
                  className="input"
                  min={form.pickupDate || today}
                  value={form.returnDate}
                  onChange={(event) => updateField("returnDate", event.target.value)}
                />
              </FormField>
              <FormField label="Horário de Retirada">
                <input
                  type="time"
                  className="input"
                  value={form.pickupTime}
                  onChange={(event) => updateField("pickupTime", event.target.value)}
                />
              </FormField>
              <FormField label="Horário de Devolução">
                <input
                  type="time"
                  className="input"
                  value={form.returnTime}
                  onChange={(event) => updateField("returnTime", event.target.value)}
                />
              </FormField>
              <FormField label="Local de Retirada">
                <LocationSelect
                  value={form.pickupLocation}
                  onChange={(location) => updateField("pickupLocation", location)}
                />
              </FormField>
              <FormField label="Local de Devolução">
                <LocationSelect
                  value={form.returnLocation}
                  onChange={(location) => updateField("returnLocation", location)}
                />
              </FormField>
            </div>
            <button type="submit" className="btn btn-accent w-full">
              Criar Reserva
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-medium">Resumo dos Custos</h3>
            <CostSummary pricePerDay={pricePerDay} rentalDays={rentalDays} />
          </div>
          <div className="card p-5">
            <h3 className="mb-2 font-medium">Informações Importantes</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>⏰ Horário: Seg-Sex 7h–22h | Sáb-Dom 8h–20h</li>
              <li>🪪 Documentos: CNH válida e cartão de crédito</li>
            </ul>
          </div>
        </div>
      </div>

      <NewClientModal
        open={isNewClientModalOpen}
        cpf={cpf}
        onClose={() => setIsNewClientModalOpen(false)}
      />
    </>
  );
}

function LocationSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (location: string) => void;
}) {
  return (
    <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
      {RENTAL_LOCATIONS.map((location) => (
        <option key={location}>{location}</option>
      ))}
    </select>
  );
}
