import { Link } from "react-router-dom";
import { Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { useBrand } from "@/hooks/use-brand";
import { SITE, checkoutLink } from "@/lib/site";

const plans = [
  {
    slug: "start",
    name: "Start",
    price: "R$ 2.900",
    period: "/mês",
    desc: "Para validar um módulo e provar valor rápido.",
    items: [
      "1 módulo SaaS sob medida",
      "Dashboard de dados em tempo real",
      "Integrações essenciais",
      "Suporte em horário comercial",
    ],
  },
  {
    slug: "growth",
    name: "Growth",
    price: "R$ 6.900",
    period: "/mês",
    desc: "Para operações que já rodam e precisam escalar.",
    highlight: true,
    items: [
      "Até 4 módulos SaaS",
      "IA aplicada ao seu contexto",
      "Análise comportamental e de atendimento",
      "Estratégias de campanha mensais",
      "Suporte prioritário",
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    desc: "Plataforma completa, multiempresa e white-label.",
    items: [
      "Módulos ilimitados",
      "Infra dedicada e SSO",
      "Modelos de IA privados",
      "Squad dedicado",
      "SLA contratual",
    ],
  },
];

const Plans = () => {
  const { profile } = useBrand();
  const brandName = profile.brandName || SITE.name;

  return (
    <div className="dark relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title={`Planos e preços — ${brandName}`}
        description="Conheça os planos do VYXN Digital: Start, Growth e Enterprise. Soluções SaaS sob medida com dados, IA e automação, com checkout direto."
        path="/planos"
        jsonLd={{
          "@type": "Product",
          name: `${brandName} — Planos SaaS`,
          brand: { "@type": "Brand", name: brandName },
          offers: plans.map((p) => ({
            "@type": "Offer",
            name: p.name,
            price: p.price,
            priceCurrency: "BRL",
            url: `${SITE.domain}/planos`,
          })),
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-indigo-500/15 blur-[170px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-primary/40 bg-primary/10">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt={`Ícone ${brandName}`} className="h-full w-full object-contain" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
            </div>
            <span className="gradient-text text-lg tracking-wide">{brandName}</span>
          </Link>
          <Button asChild variant="ghost">
            <Link to="/">Voltar ao site</Link>
          </Button>
        </header>

        <section className="mt-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl">
            Planos e <span className="gradient-text">preços</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Escolha o plano, finalize a assinatura no nosso site de vendas e comece em poucos dias.
          </p>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.slug}
              className={`glass-card flex flex-col p-8 ${
                p.highlight
                  ? "border-primary/50 shadow-[0_0_60px_-16px_hsl(var(--primary)/0.9)]"
                  : "border-primary/10"
              }`}
            >
              {p.highlight && (
                <span className="mb-4 inline-block w-fit rounded-full bg-primary/15 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
                  mais escolhido
                </span>
              )}
              <h2 className="text-xl">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <p className="mt-6 text-3xl">
                {p.price}
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {i}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full rounded-full gap-2" variant={p.highlight ? "default" : "outline"}>
                <a href={checkoutLink(p.slug)} target="_blank" rel="noopener noreferrer">
                  Assinar {p.name} <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </section>

        <section className="glass-card mt-14 flex flex-col items-center gap-4 border-primary/30 p-10 text-center">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h2 className="text-2xl">Ainda com dúvida sobre o plano ideal?</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Fale com a gente e receba uma recomendação com escopo, prazo e impacto esperado.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/contato">Falar com especialista</Link>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Plans;
