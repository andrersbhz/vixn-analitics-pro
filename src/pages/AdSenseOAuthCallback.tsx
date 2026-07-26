import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, DollarSign, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const callbackPath = "/adsense/oauth/callback";

const getSafeReturnPath = (stateRaw: string) => {
  try {
    const decoded = JSON.parse(atob(stateRaw));
    const target = typeof decoded?.return_to === "string" ? decoded.return_to : "/settings";
    const url = new URL(target, window.location.origin);
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return "/settings";
  }

  return "/settings";
};

const AdSenseOAuthCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Conectando Google AdSense...");

  const redirectUri = useMemo(() => `${window.location.origin}${callbackPath}`, []);

  useEffect(() => {
    const finishConnection = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state") || "";
      const googleError = params.get("error");
      const returnPath = getSafeReturnPath(state);

      if (googleError) {
        setStatus("error");
        setMessage(`Google recusou a autorização: ${googleError}`);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("Código de autorização não retornado pelo Google.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("adsense-oauth-callback", {
          body: {
            code,
            state,
            redirect_uri: redirectUri,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setStatus("success");
        setMessage(data?.warning || "Google AdSense conectado com sucesso.");
        window.setTimeout(() => window.location.replace(returnPath), 1400);
      } catch (error: unknown) {
        const description = error instanceof Error ? error.message : "Falha ao finalizar OAuth do AdSense.";
        setStatus("error");
        setMessage(description);
      }
    };

    finishConnection();
  }, [redirectUri]);

  const Icon = status === "loading" ? Loader2 : status === "success" ? CheckCircle2 : XCircle;

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <section className="glass-card w-full max-w-md rounded-2xl border border-border/60 p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <DollarSign className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-3">
          <Icon className={`mx-auto h-8 w-8 ${status === "loading" ? "animate-spin text-primary" : status === "success" ? "text-emerald-500" : "text-destructive"}`} />
          <h1 className="text-2xl font-extralight tracking-wide">Google AdSense</h1>
          <p className="text-sm font-light leading-relaxed text-muted-foreground">{message}</p>
        </div>
        {status === "error" && (
          <Button onClick={() => window.location.replace("/settings")} className="w-full">
            Voltar para configurações
          </Button>
        )}
      </section>
    </main>
  );
};

export default AdSenseOAuthCallback;