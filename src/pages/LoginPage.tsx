import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import FormField from "../components/FormField";
import FormMessage, { type FormMessageData } from "../components/FormMessage";
import ThemeToggle from "../components/ThemeToggle";
import { ROUTES } from "../routes";
import { useAppStore } from "../store/useAppStore";

// foto salva no projeto (Unsplash)
const LOGIN_IMAGE_URL = "/login.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<FormMessageData | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    try {
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    }
  };

  return (
    <div className="login-background grid min-h-screen place-items-center">
      <div className="card grid w-[1000px] overflow-hidden md:grid-cols-2">
        <img
          src={LOGIN_IMAGE_URL}
          alt="Carro preto estacionado numa estrada de terra"
          className="h-[560px] w-full object-cover"
        />
        <div className="space-y-4 p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="" className="h-10 w-10 rounded-xl" />
              <h1 className="text-3xl font-extrabold text-link">Localiza-ae</h1>
            </div>
            <ThemeToggle iconOnly />
          </div>
          <p className="text-muted">Sistema de Aluguel de Carros para Funcionários</p>

          <FormMessage message={message} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email">
              <input
                type="email"
                autoComplete="username"
                required
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            <FormField label="Senha">
              <input
                type="password"
                autoComplete="current-password"
                required
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
            <button className="btn btn-accent w-full">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
