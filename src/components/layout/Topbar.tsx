import { memo, useCallback, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sun, Moon, LogOut, ChevronRight, Bell } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
    <header className="flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {crumb.to && index < breadcrumbs.length - 1 ? (
              <Link
                to={crumb.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium",
                  index === breadcrumbs.length - 1
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full px-2 py-1 h-auto gap-2"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">
                  {user?.name ?? "User"}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user?.role ?? "-"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Badge variant="secondary" className="capitalize text-xs">
                {user?.role ?? "user"}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});
