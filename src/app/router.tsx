import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "./hooks";
import LoginPage from "../features/auth/pages/LoginPage";
import AppShell from "../components/layout/AppShell";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProductListPage from "../features/products/pages/ProductListPage";
import AddProductPage from "../features/products/pages/AddProductPage";
import EditProductPage from "../features/products/pages/EditProductPage";
import CreateSalePage from "../features/sales/pages/CreateSalePage";
import SaleHistoryPage from "../features/sales/pages/SaleHistoryPage";
import UsersListPage from "../features/users/pages/UsersListPage";
import RolesListPage from "../features/roles/pages/RolesListPage";
import CategoriesListPage from "../features/categories/pages/CategoriesListPage";

function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RoleRoute({ roles }: { roles: string[] }) {
  const user = useAppSelector((state) => state.auth.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "products", element: <ProductListPage /> },
          {
            element: <RoleRoute roles={["admin", "manager"]} />,
            children: [
              { path: "products/new", element: <AddProductPage /> },
              { path: "products/:id/edit", element: <EditProductPage /> },
              { path: "categories", element: <CategoriesListPage /> },
            ],
          },
          { path: "sales", element: <SaleHistoryPage /> },
          { path: "sales/new", element: <CreateSalePage /> },
          {
            element: <RoleRoute roles={["admin"]} />,
            children: [
              { path: "users", element: <UsersListPage /> },
              { path: "roles", element: <RolesListPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
