import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import FormField from "../components/FormField";
import FormMessage, { type FormMessageData } from "../components/FormMessage";
import { MIN_PASSWORD_LENGTH } from "../domain/types";
import { ROUTES } from "../routes";
import { useAppStore } from "../store/useAppStore";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmation: "" };

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const changePassword = useAppStore((state) => state.changePassword);
  const showToast = useAppStore((state) => state.showToast);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<FormMessageData | null>(null);

  const isTemporaryPassword = user?.mustChangePassword ?? false;

  const updateField = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setMessage({
        type: "error",
        text: `A nova senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
      return;
    }
    if (form.newPassword !== form.confirmation) {
      setMessage({ type: "error", text: "A confirmação não bate com a nova senha." });
      return;
    }

    try {
      await changePassword(form.currentPassword, form.newPassword);
      showToast("Senha alterada.", "success");
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-link">Alterar Senha</h2>
        {isTemporaryPassword && (
          <p className="mt-1 text-subtle">
            Você entrou com uma senha provisória. Crie uma senha sua pra continuar.
          </p>
        )}
      </div>

      <FormMessage message={message} />

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <FormField label={isTemporaryPassword ? "Senha provisória" : "Senha atual"}>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="input"
            value={form.currentPassword}
            onChange={(event) => updateField("currentPassword", event.target.value)}
          />
        </FormField>
        <FormField label={`Nova senha (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}>
          <input
            type="password"
            autoComplete="new-password"
            required
            className="input"
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
          />
        </FormField>
        <FormField label="Confirme a nova senha">
          <input
            type="password"
            autoComplete="new-password"
            required
            className="input"
            value={form.confirmation}
            onChange={(event) => updateField("confirmation", event.target.value)}
          />
        </FormField>
        <button className="btn btn-primary w-full">Salvar nova senha</button>
      </form>
    </div>
  );
}
