import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3, Brain, Users, Headphones, Target, Rocket, ShieldCheck,
  Sparkles, ArrowRight, Check, Pencil, Upload, Workflow, LineChart, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useBrand } from "@/hooks/use-brand";
import { toast } from "sonner";

const solutions = [
  { icon: BarChart3, title: "Análise de Dados", desc: "Dashboards vivos que unificam vendas, mídia e operação em uma só fonte de verdade." },
  { icon: Brain, title: "Inteligência Artificial", desc: "Agentes e modelos treinados no contexto do seu negócio para decidir mais rápido." },
  { icon: Users, title: "Análise Comportamental", desc: "Entenda jornada, intenção e churn antes que eles aconteçam." },
  { icon: Headphones, title: "Análise de Atendimento", desc: "Leitura automática de conversas, sentimento, SLA e qualidade do time." },
  { icon: Target, title: "Análise de Mercado", desc: "Tamanho de mercado, concorrência e CAC médio com pesquisa assistida por IA." },
  { icon: Rocket, title: "Estratégias de Campanha", desc: "Planos de mídia, copies e funis prontos para Google, Meta, TikTok e LinkedIn." },
  { icon: Workflow, title: "Automação de Processos", desc: "Fluxos sob medida que eliminam trabalho manual e reduzem custo operacional." },
  { icon: LineChart, title: "Previsão e Forecast", desc: "Projeções de receita e demanda baseadas no histórico real da sua operação." },
];

const steps = [
  { n: "01", t: "Diagnóstico", d: "Mapeamos processos, dados e gargalos do seu negócio." },
  { n: "02", t: "Arquitetura", d: "Desenhamos o SaaS sob medida: módulos, integrações e IA." },
  { n: "03", t: "Construção", d: "Entregas semanais, ambiente seguro e escalável na nuvem." },
  { n: "04", t: "Escala", d: "Monitoramento, evolução contínua e novos módulos sob demanda." },
];

const plans = [
  { name: "Start", price: "R$ 2.900", period: "/mês", desc: "Para validar um módulo e provar valor rápido.", items: ["1 módulo SaaS sob medida", "Dashboard de dados", "Integrações essenciais", "Suporte em horário comercial"] },
  { name: "Growth", price: "R$ 6.900", period: "/mês", desc: "Para operações que já rodam e precisam escalar.", items: ["Até 4 módulos", "IA aplicada ao seu contexto", "Análise comportamental e de atendimento", "Estratégias de campanha mensais", "Suporte prioritário"], highlight: true },
  { name: "Enterprise", price: "Sob consulta", period: "", desc: "Plataforma completa, multiempresa e white-label.", items: ["Módulos ilimitados", "Infra dedicada e SSO", "Modelos de IA privados", "Squad dedicado", "SLA contratual"] },
];

const faqs = [
  { q: "Vocês criam do zero ou usam template?", a: "Do zero, sobre uma base própria já validada. Isso reduz o prazo sem engessar o produto." },
  { q: "Em quanto tempo eu vejo resultado?", a: "A primeira entrega útil costuma ir ao ar entre 2 e 4 semanas, com dados reais da sua operação." },
  { q: "Meus dados ficam seguros?", a: "Sim. Isolamento por empresa, autenticação, criptografia e políticas de acesso por usuário." },
  { q: "Consigo integrar com o que já uso?", a: "Sim: ERPs, CRMs, WhatsApp, Google, Meta, planilhas e APIs internas." },
];

const BrandEditor = () => {
  const { profile, save } = useBrand();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.brandName);
  const [logo, setLogo] = useState(profile.logoUrl);
  const [saving, setSaving] = useState(false);

  const onFile = (file?: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Imagem muito grande (máx. 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    setSaving(true);
    const res = await save({ brandName: name, logoUrl: logo });
    setSaving(false);
    if (res?.ok) toast.success("Marca atualizada.");
    else toast.message("Salvo neste dispositivo. Entre na sua conta para sincronizar.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setName(profile.brandName); setLogo(profile.logoUrl); } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar nome e ícone da marca" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/20">
        <DialogHeader><DialogTitle>Nome e ícone do sistema</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Nome</Label>
            <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do sistema" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand-icon">Ícone / logomarca</Label>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center overflow-hidden">
                {logo ? <img src={logo} alt="Prévia do ícone" className="h-full w-full object-contain" /> : <Sparkles className="h-6 w-6 text-primary" />}
              </div>
              <Input id="brand-icon" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="cursor-pointer" />
            </div>
            <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="ou cole a URL do ícone" className="text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            <Upload className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Landing = () => {
  const { profile } = useBrand();
  const brandName = profile.brandName || "VYXN Digital";

  return (
    <div className="dark relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-indigo-500/15 blur-[170px]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl border border-primary/40 bg-primary/10 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.7)] flex items-center justify-center">
                {profile.logoUrl ? <img src={profile.logoUrl} alt={`Ícone ${brandName}`} className="h-full w-full object-contain" /> : <Sparkles className="h-5 w-5 text-primary" />}
              </div>
              <span className="text-lg tracking-wide gradient-text">{brandName}</span>
              <BrandEditor />
            </div>
            <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
              <a href="#solucoes" className="transition hover:text-foreground">Soluções</a>
              <a href="#como" className="transition hover:text-foreground">Como funciona</a>
              <a href="#planos" className="transition hover:text-foreground">Planos</a>
              <a href="#faq" className="transition hover:text-foreground">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/login">Entrar</Link></Button>
              <Button asChild className="rounded-full shadow-[0_0_28px_-6px_hsl(var(--primary)/0.9)]">
                <a href="#contato">Falar com especialista</a>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 md:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> SaaS sob medida
              </span>
              <h1 className="mt-6 text-4xl leading-[1.08] md:text-6xl">
                Soluções <span className="gradient-text">SaaS criadas para o seu negócio</span> — dados, IA e crescimento no mesmo lugar.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Desenvolvemos plataformas próprias para empresas de todos os portes: análise de dados, inteligência artificial,
                comportamento do cliente, atendimento, mercado e estratégias de campanha — tudo em um sistema com a sua marca.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8 shadow-[0_0_36px_-6px_hsl(var(--primary)/0.9)]">
                  <a href="#contato" className="gap-2">Quero minha solução <ArrowRight className="h-4 w-4" /></a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 px-8 hover:border-primary/60">
                  <a href="#solucoes">Ver soluções</a>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[["+120", "projetos entregues"], ["4x", "velocidade de decisão"], ["98%", "retenção de clientes"]].map(([k, v]) => (
                  <div key={v}>
                    <dt className="text-2xl text-primary md:text-3xl">{k}</dt>
                    <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="glass-card sheen neon-glow border-primary/20 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Painel inteligente</p>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">ao vivo</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[["Receita", "R$ 482.9k", "+18,4%"], ["Leads", "12.480", "+9,1%"], ["Churn", "1,8%", "-0,6%"], ["CAC", "R$ 74", "-12%"]].map(([l, v, d]) => (
                    <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</p>
                      <p className="mt-2 text-xl text-foreground">{v}</p>
                      <p className="mt-1 text-xs text-primary">{d}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 h-32 rounded-2xl border border-primary/20 bg-gradient-to-t from-primary/25 to-transparent" />
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Bot className="h-5 w-5 shrink-0 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    IA: “Aumente 15% do orçamento na campanha de retargeting — CPA 22% abaixo da meta.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Soluções */}
        <section id="solucoes" className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl">Soluções que resolvem <span className="gradient-text">problemas reais</span></h2>
            <p className="mt-4 text-muted-foreground">Cada módulo é construído a partir da sua operação — nada de software genérico.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="glass-card group border-primary/10 p-6 hover:border-primary/50 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.65)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_22px_-6px_hsl(var(--primary)/0.8)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section id="como" className="mx-auto max-w-7xl px-5 py-20">
          <div className="glass-card border-primary/15 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl">Do diagnóstico ao <span className="gradient-text">SaaS rodando</span></h2>
            <div className="mt-12 grid gap-8 md:grid-cols-4">
              {steps.map((s) => (
                <div key={s.n} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <span className="text-sm tracking-[0.3em] text-primary">{s.n}</span>
                  <h3 className="mt-3 text-lg">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl">Planos que acompanham <span className="gradient-text">seu crescimento</span></h2>
            <p className="mt-4 text-muted-foreground">Comece pequeno, escale por módulos. Sem fidelidade escondida.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className={`glass-card p-8 ${p.highlight ? "border-primary/50 shadow-[0_0_60px_-16px_hsl(var(--primary)/0.9)]" : "border-primary/10"}`}>
                {p.highlight && <span className="mb-4 inline-block rounded-full bg-primary/15 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">mais escolhido</span>}
                <h3 className="text-xl">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <p className="mt-6 text-3xl">{p.price}<span className="text-sm text-muted-foreground">{p.period}</span></p>
                <ul className="mt-6 space-y-3">
                  {p.items.map((i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {i}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full rounded-full" variant={p.highlight ? "default" : "outline"}>
                  <a href="#contato">Começar agora</a>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="text-3xl md:text-4xl">Perguntas frequentes</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="glass-card border-primary/10 p-6">
                <h3 className="text-base">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contato" className="mx-auto max-w-7xl px-5 pb-24">
          <div className="glass-card sheen relative overflow-hidden border-primary/40 p-10 text-center shadow-[0_0_80px_-24px_hsl(var(--primary))] md:p-16">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-6 text-3xl md:text-5xl">Vamos construir o SaaS do <span className="gradient-text">seu negócio</span></h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              Conte o seu desafio. Em até 48h você recebe um diagnóstico com escopo, prazo e o impacto esperado.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-10 shadow-[0_0_40px_-6px_hsl(var(--primary))]">
                <a href="mailto:contato@vyxndigital.com?subject=Quero%20uma%20solu%C3%A7%C3%A3o%20SaaS">Solicitar diagnóstico</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 px-10">
                <Link to="/login">Acessar plataforma</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center">
                {profile.logoUrl ? <img src={profile.logoUrl} alt={brandName} className="h-full w-full object-contain" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </div>
              <span>{brandName}</span>
            </div>
            <p>© {new Date().getFullYear()} {brandName}. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
