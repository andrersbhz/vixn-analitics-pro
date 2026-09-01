import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Seo from "@/components/Seo";
import { useBrand } from "@/hooks/use-brand";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

const LeadCapture = () => {
  const { profile } = useBrand();
  const brandName = profile.brandName || SITE.name;
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Informe nome e e-mail.");
      return;
    }
    setSending(true);
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        message: form.message.trim() || null,
        source: "landing",
      })
      .select("id")
      .maybeSingle();

    if (!error && form.message.trim()) {
      await supabase.from("contact_messages").insert({
        lead_id: data?.id ?? null,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: "Contato pela landing page",
        content: form.message.trim(),
        channel: "site",
      });
    }
    setSending(false);

    if (error) {
      console.error("lead insert failed", error);
      toast.error("Não foi possível enviar agora. Tente novamente.");
      return;
    }
    setSent(true);
    setForm({ name: "", email: "", phone: "", company: "", message: "" });
    toast.success("Recebemos seu contato! Retornamos em breve.");
  };

  return (
    <div className="dark relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title={`Fale com a gente — ${brandName}`}
        description="Envie seu nome, e-mail e mensagem e receba um diagnóstico gratuito sobre a solução SaaS ideal para o seu negócio."
        path="/contato"
        jsonLd={{ "@type": "ContactPage", name: `Contato ${brandName}` }}
      />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-[170px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-16">
        <Link to="/" className="flex w-fit items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-primary/40 bg-primary/10">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt={`Ícone ${brandName}`} className="h-full w-full object-contain" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
          </div>
          <span className="gradient-text text-lg tracking-wide">{brandName}</span>
        </Link>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl md:text-5xl">
              Vamos falar sobre o <span className="gradient-text">seu projeto</span>
            </h1>
            <p className="mt-5 text-muted-foreground">
              Preencha o formulário: em até 48h você recebe um diagnóstico com escopo, prazo e impacto esperado.
              Seu contato fica registrado no nosso painel e nenhuma mensagem se perde.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {["Diagnóstico gratuito", "Resposta em até 48h", "Sem compromisso"].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {i}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={submit} className="glass-card space-y-4 border-primary/20 p-8">
            {sent && (
              <p className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                Mensagem enviada com sucesso. Obrigado!
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="lead-name">Nome *</Label>
              <Input id="lead-name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">E-mail *</Label>
              <Input id="lead-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead-phone">Telefone</Label>
                <Input id="lead-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-company">Empresa</Label>
                <Input id="lead-company" value={form.company} onChange={(e) => update("company", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-message">Mensagem</Label>
              <Textarea id="lead-message" rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Conte o seu desafio..." />
            </div>
            <Button type="submit" disabled={sending} className="w-full gap-2 rounded-full">
              <Send className="h-4 w-4" /> {sending ? "Enviando..." : "Enviar mensagem"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadCapture;
