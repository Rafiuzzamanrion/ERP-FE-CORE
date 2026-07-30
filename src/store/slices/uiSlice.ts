import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  primaryColor: string | null;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("theme") as "light" | "dark") || "light";
}

function getInitialPrimaryColor(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("primaryColor");
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: getInitialTheme(),
  primaryColor: getInitialPrimaryColor(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
    setPrimaryColor: (state, action: PayloadAction<string | null>) => {
      state.primaryColor = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("primaryColor", action.payload);
        } else {
          localStorage.removeItem("primaryColor");
        }
      }
    },
  },
});

export const { toggleSidebar, setTheme, setPrimaryColor } = uiSlice.actions;
export default uiSlice.reducer;
