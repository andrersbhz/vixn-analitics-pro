import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PRESETS,
  ThemeTokens,
  applyTokens,
  clearTokens,
  loadStoredTokens,
  readCssVarHex,
  saveTokens,
} from "@/lib/theme-tokens";
import { Check, Palette, RotateCcw, Sparkles } from "lucide-react";

type FieldKey = keyof ThemeTokens;

const COLOR_FIELDS: { key: FieldKey; label: string; hint: string }[] = [
  { key: "primary", label: "Primária", hint: "Botões, links, destaque principal" },
  { key: "primaryForeground", label: "Texto sobre Primária", hint: "Contraste em botões" },
  { key: "secondary", label: "Secundária", hint: "Botões e áreas de apoio" },
  { key: "secondaryForeground", label: "Texto sobre Secundária", hint: "Contraste secundário" },
  { key: "accent", label: "Destaque", hint: "Chips, badges, highlights" },
  { key: "accentForeground", label: "Texto sobre Destaque", hint: "Contraste no destaque" },
  { key: "background", label: "Fundo", hint: "Cor de fundo do app" },
  { key: "foreground", label: "Texto", hint: "Texto principal" },
  { key: "card", label: "Cartão", hint: "Fundo dos cards" },
  { key: "border", label: "Borda", hint: "Divisórias e contornos" },
  { key: "ring", label: "Foco", hint: "Anel ao focar inputs" },
];

const CSS_VAR_FOR: Record<string, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  border: "--border",
  ring: "--ring",
};

export function AppearancePanel() {
  const [tokens, setTokens] = useState<ThemeTokens>({});
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredTokens();
    // Hydrate any missing color from computed CSS so pickers show real values.
    const hydrated: ThemeTokens = { ...stored };
    COLOR_FIELDS.forEach(({ key }) => {
      if (!hydrated[key]) {
        const v = readCssVarHex(CSS_VAR_FOR[key as string]);
        if (v) (hydrated as any)[key] = v;
      }
    });
    if (hydrated.radius == null) hydrated.radius = 1;
    if (hydrated.gradientAngle == null) hydrated.gradientAngle = 135;
    if (!hydrated.gradientFrom) hydrated.gradientFrom = hydrated.primary || "#22D3EE";
    if (!hydrated.gradientTo) hydrated.gradientTo = hydrated.accent || "#4F46E5";
    setTokens(hydrated);
  }, []);

  const update = (patch: Partial<ThemeTokens>) => {
    const next = { ...tokens, ...patch };
    setTokens(next);
    applyTokens(next);
  };

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const next = { ...tokens, ...preset.tokens };
    setTokens(next);
    applyTokens(next);
    setActivePreset(id);
    toast.success(`Tema "${preset.name}" aplicado`);
  };

  const handleSave = () => {
    saveTokens(tokens);
    applyTokens(tokens);
    toast.success("Aparência salva no dispositivo");
  };

  const handleReset = () => {
    clearTokens();
    setTokens({});
    setActivePreset(null);
    // Rehydrate from CSS defaults
    const hydrated: ThemeTokens = { radius: 1, gradientAngle: 135 };
    COLOR_FIELDS.forEach(({ key }) => {
      const v = readCssVarHex(CSS_VAR_FOR[key as string]);
      if (v) (hydrated as any)[key] = v;
    });
    setTokens(hydrated);
    toast.info("Aparência restaurada ao padrão");
  };

  return (
    <div className="space-y-8">
      {/* PRESETS */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Temas predefinidos
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            const grad =
              preset.tokens.gradientEnabled && preset.tokens.gradientFrom && preset.tokens.gradientTo
                ? `linear-gradient(${preset.tokens.gradientAngle ?? 135}deg, ${preset.tokens.gradientFrom}, ${preset.tokens.gradientTo})`
                : preset.tokens.primary;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all hover:border-primary/50 ${
                  isActive ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <div
                  className="h-16 w-full rounded-lg mb-3"
                  style={{ background: grad }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{preset.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
                </div>
                <div className="flex gap-1 mt-3">
                  {preset.swatches.map((c) => (
                    <span
                      key={c}
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* CUSTOM EDITOR */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Edição visual completa
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLOR_FIELDS.map(({ key, label, hint }) => {
            const value = (tokens[key] as string) || "#000000";
            return (
              <div
                key={key as string}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card/50"
              >
                <label className="relative h-10 w-10 rounded-lg border overflow-hidden shrink-0 cursor-pointer">
                  <span
                    className="absolute inset-0"
                    style={{ background: value }}
                  />
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => update({ [key]: e.target.value } as any)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{hint}</p>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => update({ [key]: e.target.value } as any)}
                    className="mt-1 w-full bg-background border rounded px-2 py-1 text-[11px] font-mono outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RADIUS */}
        <div className="p-4 rounded-xl border bg-card/50 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Arredondamento</p>
              <p className="text-[10px] text-muted-foreground">
                Raio de bordas em botões, cards e inputs.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {(tokens.radius ?? 1).toFixed(2)} rem
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={tokens.radius ?? 1}
            onChange={(e) => update({ radius: parseFloat(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* GRADIENT */}
        <div className="p-4 rounded-xl border bg-card/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Gradiente da marca</p>
              <p className="text-[10px] text-muted-foreground">
                Aplicado em títulos gradientes e destaques visuais.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={!!tokens.gradientEnabled}
                onChange={(e) => update({ gradientEnabled: e.target.checked })}
                className="accent-primary"
              />
              Ativar
            </label>
          </div>
          <div
            className="h-14 rounded-lg border"
            style={{
              background: tokens.gradientEnabled
                ? `linear-gradient(${tokens.gradientAngle ?? 135}deg, ${tokens.gradientFrom || "#22D3EE"}, ${tokens.gradientTo || "#4F46E5"})`
                : "repeating-linear-gradient(45deg, hsl(var(--muted)) 0 8px, transparent 8px 16px)",
            }}
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <label className="relative h-8 w-8 rounded border overflow-hidden shrink-0 cursor-pointer">
                <span className="absolute inset-0" style={{ background: tokens.gradientFrom || "#22D3EE" }} />
                <input
                  type="color"
                  value={tokens.gradientFrom || "#22D3EE"}
                  onChange={(e) => update({ gradientFrom: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <span className="text-[10px] text-muted-foreground">Início</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative h-8 w-8 rounded border overflow-hidden shrink-0 cursor-pointer">
                <span className="absolute inset-0" style={{ background: tokens.gradientTo || "#4F46E5" }} />
                <input
                  type="color"
                  value={tokens.gradientTo || "#4F46E5"}
                  onChange={(e) => update({ gradientTo: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <span className="text-[10px] text-muted-foreground">Fim</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={360}
                value={tokens.gradientAngle ?? 135}
                onChange={(e) => update({ gradientAngle: parseInt(e.target.value || "0", 10) })}
                className="w-16 bg-background border rounded px-2 py-1 text-[11px] font-mono outline-none"
              />
              <span className="text-[10px] text-muted-foreground">Ângulo°</span>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="p-5 rounded-2xl border bg-card/50 space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Prévia ao vivo
          </p>
          <h4 className="text-2xl font-extralight gradient-text tracking-wide">
            Sua marca em ação
          </h4>
          <p className="text-sm text-muted-foreground font-light">
            Este bloco reflete instantaneamente todas as suas escolhas de cor.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm">Primário</Button>
            <Button size="sm" variant="secondary">Secundário</Button>
            <Button size="sm" variant="outline">Contorno</Button>
            <Button size="sm" variant="ghost">Ghost</Button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-accent text-accent-foreground">
              Destaque
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleSave} className="flex-1">
            Salvar aparência
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Restaurar padrão
          </Button>
        </div>
      </section>
    </div>
  );
}

export default AppearancePanel;