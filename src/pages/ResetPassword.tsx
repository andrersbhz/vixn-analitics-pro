import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) setReady(true);
    };

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Senha muito curta", description: "Use pelo menos 8 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Senhas diferentes", description: "Digite a mesma senha nos dois campos." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Não foi possível alterar a senha", description: error.message });
      return;
    }

    toast({ title: "Senha atualizada", description: "Sua nova senha foi salva. Você já pode acessar o painel." });
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Definir nova senha</CardTitle>
          <CardDescription>Crie uma senha para acessar o XYXN Analytics por e-mail.</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Aguardando validação do link de recuperação.</p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>Voltar ao login</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <Input type="password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <Input type="password" placeholder="Confirmar nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Salvando..." : "Salvar nova senha"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
