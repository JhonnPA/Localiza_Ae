import { useState, type FormEvent } from "react";

import FormField from "../../components/FormField";
import FormMessage, { type FormMessageData } from "../../components/FormMessage";
import Modal from "../../components/Modal";
import type { NewClient } from "../../domain/types";
import { useAppStore } from "../../store/useAppStore";

type NewClientModalProps = {
  open: boolean;
  cpf: string;
  onClose: () => void;
};

const EMPTY_CONTACT = { name: "", email: "", phone: "" };

export default function NewClientModal({ open, cpf, onClose }: NewClientModalProps) {
  const createClient = useAppStore((state) => state.createClient);
  const showToast = useAppStore((state) => state.showToast);
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [message, setMessage] = useState<FormMessageData | null>(null);

  const updateField = (field: keyof typeof EMPTY_CONTACT, value: string) =>
    setContact((current) => ({ ...current, [field]: value }));

  const close = () => {
    setContact(EMPTY_CONTACT);
    setMessage(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const newClient: NewClient = { ...contact, cpf };

    try {
      await createClient(newClient);
      showToast("Cliente salvo com sucesso!", "success");
      close();
    } catch (error) {
      setMessage({ type: "error", text: `Erro ao salvar cliente: ${(error as Error).message}` });
    }
  };

  return (
    <Modal open={open} onClose={close} title="Adicionar Novo Cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormMessage message={message} />
        <FormField label="CPF">
          <input className="input bg-surface-muted" value={cpf} disabled />
        </FormField>
        <FormField label="Nome Completo">
          <input
            className="input"
            value={contact.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            className="input"
            value={contact.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </FormField>
        <FormField label="Telefone">
          <input
            className="input"
            value={contact.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            required
          />
        </FormField>
        <button type="submit" className="btn btn-primary w-full">
          Salvar Cliente
        </button>
      </form>
    </Modal>
  );
}
