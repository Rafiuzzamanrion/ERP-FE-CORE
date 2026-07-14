"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, logout } from "@/features/auth/api/authSlice";
import { useGetMeQuery } from "@/features/auth/api/authApi";

function SessionHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state) => state.ui.theme);

  const { data, error } = useGetMeQuery(undefined, { skip: !token || !!user });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (data?.data && !user) {
      dispatch(setUser(data.data));
    }
    if (error) {
      dispatch(logout());
    }
  }, [data, error, user, dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SessionHydrator>{children}</SessionHydrator>
        <Toaster richColors position="top-right" />
      </ErrorBoundary>
    </Provider>
  );
}
