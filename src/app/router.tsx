import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "./hooks";
import AppShell from "../components/layout/AppShell";

const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const DashboardPage = lazy(
  () => import("../features/dashboard/pages/DashboardPage")
);
const ProductListPage = lazy(
  () => import("../features/products/pages/ProductListPage")
);
const EditProductPage = lazy(
  () => import("../features/products/pages/EditProductPage")
);
const CreateSalePage = lazy(
  () => import("../features/sales/pages/CreateSalePage")
);
const SaleHistoryPage = lazy(
  () => import("../features/sales/pages/SaleHistoryPage")
);
const UsersListPage = lazy(
  () => import("../features/users/pages/UsersListPage")
);
const RolesListPage = lazy(
  () => import("../features/roles/pages/RolesListPage")
);
const CategoriesListPage = lazy(
  () => import("../features/categories/pages/CategoriesListPage")
);

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

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
    element: (
      <Lazy>
        <LoginPage />
      </Lazy>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: (
              <Lazy>
                <DashboardPage />
              </Lazy>
            ),
          },
          {
            path: "products",
            element: (
              <Lazy>
                <ProductListPage />
              </Lazy>
            ),
          },
          {
            element: <RoleRoute roles={["admin", "manager"]} />,
            children: [
              {
                path: "products/:id/edit",
                element: (
                  <Lazy>
                    <EditProductPage />
                  </Lazy>
                ),
              },
              {
                path: "categories",
                element: (
                  <Lazy>
                    <CategoriesListPage />
                  </Lazy>
                ),
              },
            ],
          },
          {
            path: "sales",
            element: (
              <Lazy>
                <SaleHistoryPage />
              </Lazy>
            ),
          },
          {
            path: "sales/new",
            element: (
              <Lazy>
                <CreateSalePage />
              </Lazy>
            ),
          },
          {
            element: <RoleRoute roles={["admin"]} />,
            children: [
              {
                path: "users",
                element: (
                  <Lazy>
                    <UsersListPage />
                  </Lazy>
                ),
              },
              {
                path: "roles",
                element: (
                  <Lazy>
                    <RolesListPage />
                  </Lazy>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);
