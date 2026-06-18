import { Link, useLocation } from "react-router";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/contratos", label: "Contratos", icon: FileText },
  { path: "/alertas", label: "Alertas", icon: Bell },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout, user } = useDemoAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`sidebar-glass flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <img
            src="/images/logo_pequeno.png"
            alt="ANAC"
            className="h-10 w-auto"
          />
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm tracking-wide">
                ANAC
              </span>
              <span className="text-white/50 text-[10px] tracking-wider uppercase">
                Gestão de Contratos
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-white/10 text-amber-400 border border-amber-400/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-amber-400" : ""}`} />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto text-amber-400" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-white/10 p-3 space-y-2">
          {user && sidebarOpen && (
            <div className="glass-card px-3 py-2">
              <p className="text-white text-sm font-medium truncate">
                {user.name || "Utilizador"}
              </p>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Terminar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="glass-dark mx-4 mt-4 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-4">
            <Link
              to="/alertas"
              className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                3
              </span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
              {(user?.name || "U")[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <div className="page-overlay rounded-2xl p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
