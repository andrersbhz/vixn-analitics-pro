import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PRODUCTION_ORIGIN = "https://analitics.a3solucoesdigitais.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorCode = query.get("error_code") || hash.get("error_code");
    const errorDescription = query.get("error_description") || hash.get("error_description");

    if (errorCode || errorDescription) {
      toast({
        variant: "destructive",
        title: "Falha na autenticação",
        description: errorDescription || errorCode || "Não foi possível concluir a autenticação.",
      });
    }
  }, [toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${PRODUCTION_ORIGIN}/`,
          },
        });
        if (error) throw error;

        if (data.session) {
          toast({ title: "Conta criada", description: "Acesso liberado com sucesso." });
          navigate("/");
          return;
        }

        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar a conta e depois entre normalmente.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const redirectTo = `${PRODUCTION_ORIGIN}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (error: any) {
      const message = String(error?.message || "");
      const missingOAuthSecret = /missing OAuth secret|Unsupported provider/i.test(message);

      toast({
        variant: "destructive",
        title: "Erro no Google Login",
        description: missingOAuthSecret
          ? "O provedor Google ainda não possui Client ID/Client Secret configurados no Supabase. Configure o Google OAuth no projeto para liberar este login."
          : message || "Não foi possível iniciar o login com Google.",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Criar conta" : "Entrar"}
          </CardTitle>
          <CardDescription>Escolha seu método preferido para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full gap-2 border-border/40 hover:bg-accent/50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 0 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isGoogleLoading ? "Abrindo Google..." : "Continuar com Google"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-border/40 focus:border-primary/50"
            />
            <Input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="border-border/40 focus:border-primary/50"
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Processando..." : isSignUp ? "Cadastrar" : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            className="w-full text-xs text-muted-foreground"
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Já tem uma conta? Entre aqui" : "Não tem conta? Cadastre-se agora"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
