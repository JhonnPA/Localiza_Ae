import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isManager } from "../domain/types";
import { ROUTES } from "../routes";
import { useAppStore } from "../store/useAppStore";

export function PrivateRoute({ children }: { children: ReactElement }) {
  const user = useAppStore((state) => state.user);
  const { pathname } = useLocation();

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.mustChangePassword && pathname !== ROUTES.CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }
  return children;
}

export function ManagerRoute({ children }: { children: ReactElement }) {
  const user = useAppStore((state) => state.user);
  return isManager(user) ? children : <Navigate to={ROUTES.DASHBOARD} replace />;
}
