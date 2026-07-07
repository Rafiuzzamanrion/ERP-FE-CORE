import { memo, useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  Shield,
  Tag,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { toggleSidebar } from "@/app/uiSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        to: "/products",
        label: "Products",
        icon: <Package className="h-5 w-5" />,
      },
      {
        to: "/categories",
        label: "Categories",
        icon: <Tag className="h-5 w-5" />,
        roles: ["admin", "manager"],
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        to: "/sales/new",
        label: "New Sale",
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        to: "/sales",
        label: "Sale History",
        icon: <Receipt className="h-5 w-5" />,
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        to: "/users",
        label: "Users",
        icon: <Users className="h-5 w-5" />,
        roles: ["admin"],
      },
      {
        to: "/roles",
        label: "Roles",
        icon: <Shield className="h-5 w-5" />,
        roles: ["admin"],
      },
    ],
  },
];

export const Sidebar = memo(function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  const isItemVisible = useCallback(
    (item: NavItem) => {
      if (!item.roles) return true;
      return user ? item.roles.includes(user.role) : false;
    },
    [user]
  );

  const NavLinkContent = ({
    item,
    isActive,
  }: {
    item: NavItem;
    isActive: boolean;
  }) => (
    <NavLink
      to={item.to}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20 shadow-sm"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-0.5",
        sidebarCollapsed && "justify-center px-2"
      )}
    >
      <span
        className={cn(
          "shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {item.icon}
      </span>
      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground font-bold text-lg shadow-md shadow-primary/25">
          E
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-lg font-bold tracking-tight leading-none">
              ERP
            </span>
            <span className="text-[10px] text-muted-foreground font-medium leading-tight">
              Management
            </span>
          </div>
        )}
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          const matchingItems = visibleItems.filter(
            (item) =>
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(`${item.to}/`))
          );
          const activeItem = matchingItems.sort(
            (a, b) => b.to.length - a.to.length
          )[0];

          return (
            <div key={section.title} className="mb-5">
              {!sidebarCollapsed && (
                <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = activeItem?.to === item.to;
                  return (
                    <li key={item.to}>
                      {sidebarCollapsed ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <NavLinkContent
                                  item={item}
                                  isActive={isActive}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="rounded-lg">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <NavLinkContent item={item} isActive={isActive} />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="p-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200",
            sidebarCollapsed && "justify-center"
          )}
          onClick={() => dispatch(toggleSidebar())}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 lg:hidden rounded-lg"
        onClick={() => setMobileOpen(false)}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3.5 z-50 lg:hidden p-2.5 rounded-xl bg-card border border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-200"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "relative flex flex-col bg-card transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "lg:static lg:translate-x-0",
          "lg:my-3 lg:ml-3 lg:rounded-2xl lg:border lg:border-border/40 lg:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
          sidebarCollapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileOpen &&
            "fixed inset-y-0 left-0 z-50 w-64 rounded-r-2xl border-r border-border/40 shadow-2xl"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
});
