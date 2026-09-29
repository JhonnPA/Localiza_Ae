import { Moon, Sun } from "lucide-react";

import { useTheme } from "../hooks/useTheme";

const ICON_SIZE = 18;

type ThemeToggleProps = {
  // só o ícone num botão redondo (é o do login), sem isso mostra ícone + texto
  iconOnly?: boolean;
};

export default function ThemeToggle({ iconOnly = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Modo claro" : "Modo escuro";
  const icon = isDark ? <Sun size={ICON_SIZE} /> : <Moon size={ICON_SIZE} />;

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={label}
        aria-label={label}
        className="grid h-9 w-9 place-items-center rounded-full border text-muted transition hover:bg-surface-muted hover:text-link"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 text-muted hover:text-link"
    >
      {icon}
      {label}
    </button>
  );
}
