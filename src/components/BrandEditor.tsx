import { useEffect, useState } from "react";
import { ImageUp, Link2, Pencil, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBrand } from "@/hooks/use-brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandEditorProps = {
  compact?: boolean;
  className?: string;
};

const MAX_LOGO_SIZE = 2 * 1024 * 1024;

export default function BrandEditor({ compact = true, className = "" }: BrandEditorProps) {
  const { profile, save } = useBrand();
  const [open, setOpen] = useState(false);
  const [brandName, setBrandName] = useState(profile.brandName);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBrandName(profile.brandName);
    setLogoUrl(profile.logoUrl);
  }, [open, profile.brandName, profile.logoUrl]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("A imagem deve ter no máximo 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result || ""));
    reader.onerror = () => toast.error("Não foi possível ler a imagem.");
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const name = brandName.trim();
    if (!name) {
      toast.error("Informe o nome da marca.");
      return;
    }
    setSaving(true);
    const result = await save({ brandName: name, logoUrl: logoUrl.trim() });
    setSaving(false);
    if (result.ok) toast.success("Marca atualizada em todo o sistema.");
    else if (result.reason === "not_authenticated") toast.success("Marca atualizada neste dispositivo.");
    else {
      toast.error("A marca foi salva neste dispositivo, mas não foi sincronizada.");
      return;
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "sm"}
          aria-label="Editar nome e ícone da marca"
          title="Editar marca"
          className={`neon-interactive shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary ${compact ? "h-8 w-8" : "gap-2"} ${className}`}
        >
          <Pencil className="h-3.5 w-3.5" />
          {!compact && <span>Editar marca</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="dark overflow-hidden border-primary/35 bg-[#090709]/95 text-foreground shadow-[0_0_70px_rgba(247,6,112,.22)] backdrop-blur-2xl sm:max-w-lg">
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/20 blur-[70px]" />
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-black tracking-[-.04em]">Identidade da marca</DialogTitle>
          <DialogDescription>O nome e o ícone serão usados na landing page, no sistema e nos relatórios.</DialogDescription>
        </DialogHeader>

        <div className="relative space-y-5 py-2">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/35 bg-primary/10 shadow-[0_0_28px_rgba(247,6,112,.18)]">
              {logoUrl ? <img src={logoUrl} alt="Prévia da marca" className="h-full w-full object-contain" /> : <Sparkles className="h-7 w-7 text-primary" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Prévia</p>
              <p className="mt-1 truncate text-xl font-black">{brandName || "Nome da marca"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Atualização instantânea após salvar.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-editor-name">Nome da marca</Label>
            <Input id="brand-editor-name" value={brandName} onChange={(event) => setBrandName(event.target.value)} maxLength={60} placeholder="Ex.: VYXN Digital" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="brand-editor-file">Ícone ou logomarca</Label>
            <label htmlFor="brand-editor-file" className="neon-interactive flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/35 bg-primary/[.055] px-4 py-4 text-sm text-muted-foreground hover:text-primary">
              <ImageUp className="h-4 w-4" /> Enviar imagem (PNG, JPG, WebP ou SVG)
            </label>
            <Input id="brand-editor-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleFile(event.target.files?.[0])} className="sr-only" />
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={logoUrl.startsWith("data:") ? "" : logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="ou cole a URL da imagem" className="pl-9" />
            </div>
            {logoUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl("")} className="gap-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /> Remover ícone</Button>}
          </div>
        </div>

        <DialogFooter className="relative">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="neon-button gap-2 rounded-full px-6"><Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar marca"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
