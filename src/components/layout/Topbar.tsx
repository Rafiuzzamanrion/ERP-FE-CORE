import { memo, useCallback, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sun, Moon, LogOut, ChevronRight, Bell, Home } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { setTheme } from "@/app/uiSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const breadcrumbMap: Record<string, { label: string; to?: string }[]> = {
  "/": [{ label: "Dashboard" }],
  "/products": [{ label: "Inventory" }, { label: "Products" }],
  "/products/:id/edit": [
    { label: "Inventory" },
    { label: "Products", to: "/products" },
    { label: "Edit Product" },
  ],
  "/categories": [{ label: "Inventory" }, { label: "Categories" }],
  "/sales": [{ label: "Sales" }, { label: "Sale History" }],
  "/sales/new": [{ label: "Sales" }, { label: "New Sale" }],
  "/users": [{ label: "Admin" }, { label: "Users" }],
  "/roles": [{ label: "Admin" }, { label: "Roles" }],
};

function getBreadcrumbs(pathname: string) {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  if (pathname.startsWith("/products/") && pathname.endsWith("/edit")) {
    return breadcrumbMap["/products/:id/edit"];
  }
  return [{ label: pathname.replace("/", "") || "Dashboard" }];
}

export const Topbar = memo(function Topbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state) => state.ui.theme);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  const toggleTheme = useCallback(() => {
    dispatch(setTheme(theme === "light" ? "dark" : "light"));
  }, [dispatch, theme]);

  const initials = useMemo(
    () =>
      user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U",
    [user?.name]
  );

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="flex h-16 items-center justify-between border border-border/40 bg-card/85 backdrop-blur-xl px-6 sticky top-3 z-30 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] mx-3 mt-3">
      <nav
        className="flex items-center gap-1.5 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          to="/"
          className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted/50"
        >
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            {crumb.to && index < breadcrumbs.length - 1 ? (
              <Link
                to={crumb.to}
                className="px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-foreground text-sm">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-muted/80 transition-all duration-300 hover:rotate-12"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-[18px] w-[18px] text-muted-foreground" />
          ) : (
            <Sun className="h-[18px] w-[18px] text-muted-foreground" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative hover:bg-muted/80 transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary ring-2 ring-card" />
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full pl-2 pr-3 py-1.5 h-auto gap-2.5 hover:bg-muted/80 transition-all duration-200"
            >
              <Avatar className="h-8 w-8 ring-2 ring-border/50">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-semibold leading-none">
                  {user?.name ?? "User"}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize leading-none mt-0.5">
                  {user?.role ?? "-"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 rounded-xl p-1 shadow-lg border-border/40"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar className="h-10 w-10 ring-2 ring-border/50">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5 overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <div className="px-3 pb-2">
              <Badge
                variant="secondary"
                className="capitalize text-[11px] font-medium rounded-lg"
              >
                {user?.role ?? "user"}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-lg mx-1 mb-0.5 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
