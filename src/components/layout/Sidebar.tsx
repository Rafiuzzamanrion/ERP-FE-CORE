import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Receipt,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { toggleSidebar } from "@/app/uiSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

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
          to: "/products/new",
          label: "Add Product",
          icon: <PlusCircle className="h-5 w-5" />,
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

  function isItemVisible(item: NavItem) {
    if (!item.roles) return true;
    return user ? item.roles.includes(user.role) : false;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold tracking-tight">ERP</span>
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

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-4">
              {!sidebarCollapsed && (
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/70 hover:bg-accent hover:text-foreground",
                          sidebarCollapsed && "justify-center px-2"
                        )}
                      >
                        {item.icon}
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
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
        className="fixed left-4 top-3 z-50 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
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
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarCollapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
