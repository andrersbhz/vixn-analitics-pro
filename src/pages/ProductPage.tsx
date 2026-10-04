import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { formatBRL, useProducts } from "@/hooks/use-catalog";
import { useBrand } from "@/hooks/use-brand";
import { SITE } from "@/lib/site";

const ProductPage = () => {
  const { slug } = useParams();
  const { data, isLoading } = useProducts();
  const { profile } = useBrand();
  const brandName = profile.brandName || SITE.name;
  const p = data?.find((x) => x.slug === slug);

  return (
    <div className="octo-page dark min-h-screen overflow-x-hidden bg-[#030303] text-[#f8f7f2]">
      {p && <Seo title={`${p.title} — ${brandName}`} description={p.short_description || p.description?.slice(0, 150) || p.title} path={`/produto/${p.slug}`} jsonLd={{ "@type": "Product", name: p.title, image: p.image_url?.startsWith("http") ? p.image_url : undefined, offers: { "@type": "Offer", price: p.price, priceCurrency: "BRL" } }} />}
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/15 blur-[160px]" />
      <header className="relative z-10 mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-primary"><ArrowLeft className="h-4 w-4" />{brandName}</Link>
        <Link to="/#produtos" className="text-xs font-semibold uppercase tracking-[.12em] text-white/55 hover:text-primary">Todos os produtos</Link>
      </header>
      <main className="relative z-10 mx-auto max-w-[1280px] px-5 pb-24 pt-6 md:px-10">
        {isLoading && <div className="aspect-[1350/1080] max-w-2xl animate-pulse rounded-[2rem] bg-white/5" />}
        {!isLoading && !p && <div className="py-32 text-center"><h1 className="text-4xl font-black">Produto não encontrado</h1><Button asChild className="neon-button mt-8 rounded-full"><Link to="/">Voltar ao início</Link></Button></div>}
        {p && <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div className="neon-card overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0c]">
            <div className="aspect-[1350/1080]">{p.image_url ? <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/20">sem imagem</div>}</div>
          </div>
          <div className="lg:sticky lg:top-8">
            {p.category && <p className="section-kicker">{p.category}</p>}
            <h1 className="mt-3 text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-[.9] tracking-[-.06em]">{p.title}</h1>
            {p.short_description && <p className="mt-5 text-lg text-white/55">{p.short_description}</p>}
            <div className="mt-8 rounded-[1.5rem] border border-primary/30 bg-primary/[.07] p-6">
              <p className="text-xs uppercase tracking-[.2em] text-white/40">Investimento</p>
              <p className="mt-2 text-5xl font-black tracking-[-.05em]">{formatBRL(p.price)}</p>
              <p className="mt-1 text-sm text-white/45">ou 12x de {formatBRL(p.price / 12)}</p>
              <Button asChild={!!p.checkout_url} disabled={!p.checkout_url} size="lg" className="neon-button mt-6 h-14 w-full rounded-full text-xs font-black uppercase tracking-[.1em]">
                {p.checkout_url ? <a href={p.checkout_url} target="_blank" rel="noreferrer">Comprar agora <ArrowRight className="ml-2 h-4 w-4" /></a> : <span>Em breve</span>}
              </Button>
              <div className="mt-5 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-wider text-white/45">
                <span className="flex flex-col items-center gap-1 text-center"><Lock className="h-4 w-4 text-primary" />Pagamento seguro</span>
                <span className="flex flex-col items-center gap-1 text-center"><Zap className="h-4 w-4 text-primary" />Acesso rápido</span>
                <span className="flex flex-col items-center gap-1 text-center"><ShieldCheck className="h-4 w-4 text-primary" />NowHubPay</span>
              </div>
            </div>
            {p.description && <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-white/60">{p.description}</div>}
          </div>
        </div>}
      </main>
    </div>
  );
};

export default ProductPage;
