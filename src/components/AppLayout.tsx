import {
  Calendar,
  Car,
  FileBarChart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { isManager } from "../domain/types";
import { ROUTES } from "../routes";
import { useAppStore } from "../store/useAppStore";
import ThemeToggle from "./ThemeToggle";
import Toast from "./Toast";

const MENU_ICON_SIZE = 18;

const MENU_ITEMS = [
  { to: ROUTES.DASHBOARD, label: "Visão Geral", Icon: LayoutDashboard, managerOnly: false },
  { to: ROUTES.CATEGORIES, label: "Categorias", Icon: Tag, managerOnly: false },
  { to: ROUTES.NEW_RESERVATION, label: "Nova Reserva", Icon: Car, managerOnly: false },
  { to: ROUTES.CLIENTS, label: "Clientes", Icon: Users, managerOnly: false },
  { to: ROUTES.EMPLOYEES, label: "Funcionários", Icon: UserCog, managerOnly: true },
  { to: ROUTES.REPORTS, label: "Relatórios", Icon: FileBarChart, managerOnly: true },
  { to: ROUTES.CALENDAR, label: "Calendário", Icon: Calendar, managerOnly: false },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const loadData = useAppStore((state) => state.loadData);

  const mustChangePassword = user?.mustChangePassword ?? false;
  // com senha provisória o menu some: a única tela liberada é a de trocar senha
  const visibleMenuItems = mustChangePassword
    ? []
    : MENU_ITEMS.filter((item) => !item.managerOnly || isManager(user));

  // roda de novo quando a senha provisória é trocada, aí os dados já podem ser carregados
  useEffect(() => {
    loadData();
  }, [loadData, mustChangePassword]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] bg-page">
      {/* fixa na altura da tela, pro rodapé (tema, senha, sair) ficar sempre embaixo */}
      <aside className="sticky top-0 flex h-screen flex-col border-r bg-surface">
        <div className="flex items-center gap-3 p-4">
          <img src="/logo.svg" alt="" className="h-9 w-9 rounded-xl" />
          <div>
            <div className="font-semibold text-link">Localiza-ae</div>
            <div className="text-xs text-subtle">{user?.email}</div>
          </div>
        </div>
        <nav className="mt-2 px-2">
          {visibleMenuItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-2 rounded-md px-3 py-2 transition ${
                  isActive ? "bg-primary text-white" : "hover:bg-surface-muted"
                }`
              }
            >
              <Icon size={MENU_ICON_SIZE} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t p-4">
          <ThemeToggle />
          <Link
            to={ROUTES.CHANGE_PASSWORD}
            className="flex items-center gap-2 text-muted hover:text-link"
          >
            <KeyRound size={MENU_ICON_SIZE} /> Alterar senha
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted hover:text-link"
          >
            <LogOut size={MENU_ICON_SIZE} /> Sair
          </button>
        </div>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
