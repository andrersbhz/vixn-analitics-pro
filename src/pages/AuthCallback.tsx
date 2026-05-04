import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code) {
      toast.success("Autenticação recebida com sucesso! Sincronizando...");
      // Aqui seria feita a troca do code pelo token via Edge Function
      setTimeout(() => {
        navigate("/settings");
      }, 2000);
    } else {
      toast.error("Falha na autenticação ou cancelado pelo usuário.");
      navigate("/settings");
    }
  }, [searchParams, navigate]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <h2 className="text-xl font-bold">Processando autenticação...</h2>
        <p className="text-muted-foreground">Você será redirecionado em instantes.</p>
      </div>
    </DashboardLayout>
  );
};

export default AuthCallback;
