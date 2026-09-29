import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import { ManagerRoute, PrivateRoute } from "./components/RouteGuards";
import CalendarPage from "./pages/CalendarPage";
import CategoriesPage from "./pages/CategoriesPage";
import ClientsPage from "./pages/clients/ClientsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import NewEmployeePage from "./pages/employees/NewEmployeePage";
import NewReservationPage from "./pages/newReservation/NewReservationPage";
import ReportsPage from "./pages/ReportsPage";
import { ROUTES } from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.NEW_RESERVATION} element={<NewReservationPage />} />
          <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
          <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
          <Route
            path={ROUTES.REPORTS}
            element={
              <ManagerRoute>
                <ReportsPage />
              </ManagerRoute>
            }
          />
          <Route
            path={ROUTES.EMPLOYEES}
            element={
              <ManagerRoute>
                <EmployeesPage />
              </ManagerRoute>
            }
          />
          <Route
            path={ROUTES.NEW_EMPLOYEE}
            element={
              <ManagerRoute>
                <NewEmployeePage />
              </ManagerRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
