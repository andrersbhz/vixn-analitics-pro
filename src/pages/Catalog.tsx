import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, ImagePlus, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CatalogPlan, Product, db, formatBRL, slugify, toProductImage, usePlans, useProducts } from "@/hooks/use-catalog";

const emptyProduct: Partial<Product> = { title: "", slug: "", short_description: "", description: "", price: 0, image_url: "", category: "", checkout_url: "", sort_order: 0, is_active: true };
const emptyPlan: Partial<CatalogPlan> = { name: "", slug: "", price: "", period: "/mês", description: "", features: [], is_highlight: false, checkout_url: "", sort_order: 0, is_active: true };

const Catalog = () => {
  const qc = useQueryClient();
  const products = useProducts(true);
  const plans = usePlans(true);
  const [prod, setProd] = useState<Partial<Product> | null>(null);
  const [plan, setPlan] = useState<Partial<CatalogPlan> | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (table: string, row: any, key: string) => {
    setSaving(true);
    const { id, created_at, updated_at, ...data } = row;
    const res = id ? await db.from(table).update(data).eq("id", id) : await db.from(table).insert(data);
    setSaving(false);
    if (res.error) return toast.error(res.error.message.includes("row-level") ? "Apenas administradores podem salvar." : res.error.message);
    toast.success("Salvo com sucesso");
    qc.invalidateQueries({ queryKey: [key] });
    return true;
  };
  const remove = async (table: string, id: string, key: string) => {
    if (!confirm("Excluir este item?")) return;
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: [key] });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Vitrine</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Produtos & Planos</h1>
        <p className="mt-2 text-muted-foreground">Tudo que você cadastrar aqui aparece automaticamente na página inicial.</p>
      </div>
      <Tabs defaultValue="products">
        <TabsList><TabsTrigger value="products">Produtos</TabsTrigger><TabsTrigger value="plans">Planos</TabsTrigger></TabsList>

        <TabsContent value="products" className="mt-6">
          <Button onClick={() => setProd({ ...emptyProduct })} className="neon-button rounded-full"><Plus className="mr-2 h-4 w-4" />Novo produto</Button>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.data?.map((p) => (
              <article key={p.id} className="neon-card overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur">
                <div className="aspect-[1350/1080] bg-muted">{p.image_url && <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />}</div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-black">{p.title}</h3>{!p.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">inativo</span>}</div>
                  <p className="mt-1 text-xl font-black text-primary">{formatBRL(p.price)}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setProd(p)}><Pencil className="mr-1 h-3 w-3" />Editar</Button>
                    <Button size="sm" variant="outline" asChild><Link to={`/produto/${p.slug}`} target="_blank"><ExternalLink className="h-3 w-3" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove("products", p.id, "products")}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </article>
            ))}
            {products.data?.length === 0 && <p className="text-muted-foreground">Nenhum produto ainda.</p>}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <Button onClick={() => setPlan({ ...emptyPlan })} className="neon-button rounded-full"><Plus className="mr-2 h-4 w-4" />Novo plano</Button>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plans.data?.map((p) => (
              <article key={p.id} className={`neon-card rounded-3xl border p-6 ${p.is_highlight ? "border-primary bg-primary/10" : "border-border bg-card/60"}`}>
                <div className="flex items-center gap-2"><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{p.name}</p>{p.is_highlight && <Star className="h-3 w-3 text-primary" />}{!p.is_active && <span className="text-xs">(inativo)</span>}</div>
                <p className="mt-3 text-3xl font-black">{p.price}<span className="text-sm font-normal text-muted-foreground">{p.period}</span></p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{p.features.map((f) => <li key={f}>• {f}</li>)}</ul>
                <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => setPlan(p)}><Pencil className="mr-1 h-3 w-3" />Editar</Button><Button size="sm" variant="ghost" onClick={() => remove("catalog_plans", p.id, "catalog_plans")}><Trash2 className="h-3 w-3" /></Button></div>
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!prod} onOpenChange={(o) => !o && setProd(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{prod?.id ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
          {prod && <div className="space-y-4">
            <div>
              <Label>Imagem (1350 × 1080 px)</Label>
              <label className="mt-2 flex aspect-[1350/1080] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-muted/40">
                {prod.image_url ? <img src={prod.image_url} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center text-sm text-muted-foreground"><ImagePlus className="mb-2 h-8 w-8 text-primary" />Clique para enviar — ajustamos para 1350×1080</span>}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setProd({ ...prod, image_url: await toProductImage(f) }); }} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Título</Label><Input value={prod.title} onChange={(e) => setProd({ ...prod, title: e.target.value, slug: prod.id ? prod.slug : slugify(e.target.value) })} /></div>
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={prod.price} onChange={(e) => setProd({ ...prod, price: Number(e.target.value) })} /></div>
              <div><Label>Endereço da página</Label><Input value={prod.slug} onChange={(e) => setProd({ ...prod, slug: slugify(e.target.value) })} /></div>
              <div><Label>Categoria</Label><Input value={prod.category ?? ""} onChange={(e) => setProd({ ...prod, category: e.target.value })} /></div>
            </div>
            <div><Label>Resumo</Label><Input value={prod.short_description ?? ""} onChange={(e) => setProd({ ...prod, short_description: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea rows={6} value={prod.description ?? ""} onChange={(e) => setProd({ ...prod, description: e.target.value })} /></div>
            <div><Label>Link de pagamento NowHubPay</Label><Input placeholder="https://nowhubpay.com/..." value={prod.checkout_url ?? ""} onChange={(e) => setProd({ ...prod, checkout_url: e.target.value })} /></div>
            <div className="flex items-center gap-3"><Switch checked={prod.is_active} onCheckedChange={(v) => setProd({ ...prod, is_active: v })} /><Label>Visível no site</Label></div>
            <Button disabled={saving || !prod.title || !prod.slug} className="w-full" onClick={async () => (await save("products", prod, "products")) && setProd(null)}>Salvar produto</Button>
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!plan} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>{plan?.id ? "Editar plano" : "Novo plano"}</DialogTitle></DialogHeader>
          {plan && <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Nome</Label><Input value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value, slug: plan.id ? plan.slug : slugify(e.target.value) })} /></div>
              <div><Label>Preço</Label><Input placeholder="R$ 2.900" value={plan.price} onChange={(e) => setPlan({ ...plan, price: e.target.value })} /></div>
              <div><Label>Período</Label><Input value={plan.period} onChange={(e) => setPlan({ ...plan, period: e.target.value })} /></div>
              <div><Label>Ordem</Label><Input type="number" value={plan.sort_order} onChange={(e) => setPlan({ ...plan, sort_order: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Descrição</Label><Input value={plan.description ?? ""} onChange={(e) => setPlan({ ...plan, description: e.target.value })} /></div>
            <div><Label>Itens incluídos (um por linha)</Label><Textarea rows={5} value={(plan.features ?? []).join("\n")} onChange={(e) => setPlan({ ...plan, features: e.target.value.split("\n") })} /></div>
            <div><Label>Link de pagamento NowHubPay</Label><Input placeholder="https://nowhubpay.com/..." value={plan.checkout_url ?? ""} onChange={(e) => setPlan({ ...plan, checkout_url: e.target.value })} /></div>
            <div className="flex items-center gap-3"><Switch checked={plan.is_highlight} onCheckedChange={(v) => setPlan({ ...plan, is_highlight: v })} /><Label>Destaque</Label></div>
            <div className="flex items-center gap-3"><Switch checked={plan.is_active} onCheckedChange={(v) => setPlan({ ...plan, is_active: v })} /><Label>Visível no site</Label></div>
            <Button disabled={saving || !plan.name} className="w-full" onClick={async () => (await save("catalog_plans", { ...plan, features: (plan.features ?? []).map((f) => f.trim()).filter(Boolean) }, "catalog_plans")) && setPlan(null)}>Salvar plano</Button>
          </div>}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Catalog;
