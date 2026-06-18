import { useDemoAuth } from "@/hooks/useDemoAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Users, Wallet } from "lucide-react";

const LOGIN_OPTIONS = [
  {
    role: "admin",
    label: "Administrador",
    email: "admin@anac.ao",
    icon: Shield,
    color: "bg-amber-500 hover:bg-amber-600",
    description: "Acesso total ao sistema",
  },
  {
    role: "gestor",
    label: "Gestor de Contratos",
    email: "gestor@anac.ao",
    icon: Users,
    color: "bg-blue-500 hover:bg-blue-600",
    description: "Gestão de contratos e fornecedores",
  },
  {
    role: "financeiro",
    label: "Financeiro",
    email: "financeiro@anac.ao",
    icon: Wallet,
    color: "bg-emerald-500 hover:bg-emerald-600",
    description: "Pagamentos e relatórios financeiros",
  },
];

export default function Login() {
  const { login } = useDemoAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url(/images/clouds.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#0A1628]/70" />

      <Card className="relative z-10 w-full max-w-md mx-4 glass-card border-white/10">
        <CardHeader className="text-center pb-2">
          <img
            src="/images/logo_pequeno.png"
            alt="ANAC"
            className="h-20 mx-auto mb-4"
          />
          <CardTitle className="text-2xl text-white">
            ANAC Contratos
          </CardTitle>
          <CardDescription className="text-white/60">
            Sistema de Gestão de Contratos Públicos
          </CardDescription>
          <p className="text-amber-400 text-sm mt-2 font-medium">
            Modo Demonstração
          </p>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          {LOGIN_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.role}
                className={`w-full h-auto py-3 px-4 ${option.color} text-white border-0 shadow-lg`}
                onClick={() => login(option.role)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-white/70">{option.description}</div>
                    <div className="text-xs text-white/50">{option.email}</div>
                  </div>
                </div>
              </Button>
            );
          })}

          <div className="pt-2 text-center">
            <p className="text-white/40 text-xs">
              Password para todos: veja no ficheiro db/seed.ts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
