import { Routes, Route } from "react-router";
import { useDemoAuth } from "./hooks/useDemoAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import NewContract from "./pages/NewContract";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, isLoading } = useDemoAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#0A1628]">
        <div className="text-center">
          <img src="/images/logo_pequeno.png" alt="ANAC" className="h-16 mx-auto mb-4 opacity-60" />
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-sm mt-3">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contratos" element={<Contracts />} />
        <Route path="/contratos/:id" element={<ContractDetail />} />
        <Route path="/contratos/novo" element={<NewContract />} />
        <Route path="/alertas" element={<Alerts />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
