import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import FormField from "../../components/FormField";
import FormMessage, { type FormMessageData } from "../../components/FormMessage";
import { MIN_PASSWORD_LENGTH, type NewEmployee } from "../../domain/types";
import { ROUTES } from "../../routes";
import { useAppStore } from "../../store/useAppStore";

const EMPTY_EMPLOYEE: NewEmployee = { name: "", email: "", password: "" };

export default function NewEmployeePage() {
  const navigate = useNavigate();
  const registerEmployee = useAppStore((state) => state.registerEmployee);
  const showToast = useAppStore((state) => state.showToast);
  const [employee, setEmployee] = useState(EMPTY_EMPLOYEE);
  const [message, setMessage] = useState<FormMessageData | null>(null);

  const updateField = (field: keyof NewEmployee, value: string) =>
    setEmployee((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!employee.name || !employee.email || !employee.password) {
      setMessage({ type: "error", text: "Preencha todos os campos." });
      return;
    }
    if (employee.password.length < MIN_PASSWORD_LENGTH) {
      setMessage({
        type: "error",
        text: `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
      return;
    }

    try {
      await registerEmployee(employee);
      showToast("Funcionário cadastrado. Ele vai trocar a senha no primeiro acesso.", "success");
      navigate(ROUTES.EMPLOYEES);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Erro ao cadastrar funcionário: ${(error as Error).message}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-link">Cadastrar Novo Funcionário</h2>
        <p className="text-subtle">
          A senha que você definir é provisória: o funcionário troca no primeiro acesso.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        <FormMessage message={message} />

        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <FormField label="Nome Completo">
            <input
              className="input"
              value={employee.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className="input"
              value={employee.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </FormField>
          <FormField label={`Senha provisória (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`}>
            <input
              type="password"
              className="input"
              value={employee.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </FormField>
          <button className="btn btn-primary w-full">Cadastrar Funcionário</button>
        </form>
      </div>
    </div>
  );
}
