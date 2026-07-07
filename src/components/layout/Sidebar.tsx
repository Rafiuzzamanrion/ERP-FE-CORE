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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        sidebarCollapsed && "justify-center px-2"
      )}
    >
      <span
        className={cn(
          "transition-colors",
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        )}
      >
        {item.icon}
      </span>
      {!sidebarCollapsed && <span>{item.label}</span>}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5 border-b">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              E
            </div>
            <span className="text-lg font-bold tracking-tight">ERP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-5 px-3">
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
            <div key={section.title} className="mb-6">
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
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
                            <TooltipContent side="right">
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

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-muted-foreground hover:text-foreground"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3 z-50 lg:hidden p-2 rounded-md bg-card border shadow-sm"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300 lg:static lg:translate-x-0",
          sidebarCollapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
});
