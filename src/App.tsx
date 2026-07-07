import { useEffect } from "react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./app/store";
import { router } from "./app/router";
import ErrorBoundary from "./app/ErrorBoundary";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { setUser, logout } from "./features/auth/authSlice";
import { useGetMeQuery } from "./features/auth/authApi";

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

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SessionHydrator>
          <RouterProvider router={router} />
        </SessionHydrator>
      </ErrorBoundary>
    </Provider>
  );
}
