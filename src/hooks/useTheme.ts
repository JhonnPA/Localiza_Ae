import { useState } from "react";

export type Theme = "light" | "dark";

// mesma chave usada no script do index.html
const THEME_STORAGE_KEY = "theme";
const DARK_CLASS = "dark";

function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains(DARK_CLASS) ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle(DARK_CLASS, nextTheme === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // sem localStorage o tema vale só até recarregar a página
    }
    setTheme(nextTheme);
  };

  return { theme, toggleTheme };
}
