// Theme token helpers: convert hex <-> HSL string used by Tailwind CSS vars,
// apply overrides on :root, and expose modern presets (some with gradients).

export type ThemeTokens = {
  primary?: string;          // hex
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  border?: string;
  ring?: string;
  radius?: number;           // rem
  gradientEnabled?: boolean;
  gradientFrom?: string;     // hex
  gradientTo?: string;       // hex
  gradientAngle?: number;    // deg
};

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
  swatches: string[];
};

export const STORAGE_KEY = "growth-suite-theme-tokens";

// ---------- color conversion ----------
export function hexToHslString(hex: string): string {
  const clean = hex.replace("#", "").trim();
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(clean)) return "0 0% 0%";
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslStringToHex(hsl: string): string {
  const m = hsl.trim().match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/);
  if (!m) return "#000000";
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function readCssVarHex(name: string): string {
  if (typeof window === "undefined") return "#000000";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? hslStringToHex(raw) : "#000000";
}

// ---------- apply / persist ----------
const VAR_MAP: Record<keyof ThemeTokens, string | null> = {
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
  radius: null,
  gradientEnabled: null,
  gradientFrom: null,
  gradientTo: null,
  gradientAngle: null,
};

export function applyTokens(tokens: ThemeTokens) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  (Object.keys(VAR_MAP) as (keyof ThemeTokens)[]).forEach((k) => {
    const cssVar = VAR_MAP[k];
    const value = tokens[k];
    if (!cssVar || value == null || value === "") return;
    if (typeof value === "string" && value.startsWith("#")) {
      root.style.setProperty(cssVar, hexToHslString(value));
    }
  });
  if (tokens.radius != null) {
    root.style.setProperty("--radius", `${tokens.radius}rem`);
  }
  if (tokens.gradientEnabled && tokens.gradientFrom && tokens.gradientTo) {
    const angle = tokens.gradientAngle ?? 135;
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(${angle}deg, ${tokens.gradientFrom}, ${tokens.gradientTo})`,
    );
  } else {
    root.style.removeProperty("--gradient-primary");
  }
}

export function loadStoredTokens(): ThemeTokens {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ThemeTokens) : {};
  } catch {
    return {};
  }
}

export function saveTokens(tokens: ThemeTokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  const root = document.documentElement;
  Object.values(VAR_MAP).forEach((v) => v && root.style.removeProperty(v));
  root.style.removeProperty("--radius");
  root.style.removeProperty("--gradient-primary");
}

// ---------- presets ----------
export const PRESETS: ThemePreset[] = [
  {
    id: "midnight-ocean",
    name: "Midnight Ocean",
    description: "Azul profundo com brilho ciano — padrão moderno.",
    swatches: ["#0B1F3A", "#1E90FF", "#22D3EE", "#0F172A"],
    tokens: {
      primary: "#1E5FD6",
      primaryForeground: "#FFFFFF",
      secondary: "#0F1B33",
      secondaryForeground: "#E6F0FF",
      accent: "#0EA5E9",
      accentForeground: "#F0F9FF",
      ring: "#1E5FD6",
      gradientEnabled: true,
      gradientFrom: "#22D3EE",
      gradientTo: "#4F46E5",
      gradientAngle: 135,
    },
  },
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    description: "Coral quente e âmbar para marcas vibrantes.",
    swatches: ["#FB7185", "#F97316", "#FBBF24", "#7C2D12"],
    tokens: {
      primary: "#F97316",
      primaryForeground: "#FFFFFF",
      secondary: "#FEF3C7",
      secondaryForeground: "#7C2D12",
      accent: "#FB7185",
      accentForeground: "#FFFFFF",
      ring: "#F97316",
      gradientEnabled: true,
      gradientFrom: "#FB7185",
      gradientTo: "#FBBF24",
      gradientAngle: 120,
    },
  },
  {
    id: "forest-mint",
    name: "Forest Mint",
    description: "Verdes profundos e menta — natural e sereno.",
    swatches: ["#064E3B", "#10B981", "#6EE7B7", "#022C22"],
    tokens: {
      primary: "#10B981",
      primaryForeground: "#022C22",
      secondary: "#ECFDF5",
      secondaryForeground: "#064E3B",
      accent: "#059669",
      accentForeground: "#FFFFFF",
      ring: "#10B981",
      gradientEnabled: true,
      gradientFrom: "#10B981",
      gradientTo: "#6EE7B7",
      gradientAngle: 135,
    },
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber",
    description: "Rosa neon e violeta elétrico com toque cyber.",
    swatches: ["#7C3AED", "#EC4899", "#22D3EE", "#0B0616"],
    tokens: {
      primary: "#8B5CF6",
      primaryForeground: "#FFFFFF",
      secondary: "#1E1B4B",
      secondaryForeground: "#E9D5FF",
      accent: "#EC4899",
      accentForeground: "#FFFFFF",
      ring: "#8B5CF6",
      gradientEnabled: true,
      gradientFrom: "#EC4899",
      gradientTo: "#8B5CF6",
      gradientAngle: 135,
    },
  },
  {
    id: "royal-gold",
    name: "Royal Gold",
    description: "Roxo real com dourado — sofisticado e premium.",
    swatches: ["#4C1D95", "#7C3AED", "#F59E0B", "#1E1B4B"],
    tokens: {
      primary: "#7C3AED",
      primaryForeground: "#FFFFFF",
      secondary: "#EDE9FE",
      secondaryForeground: "#4C1D95",
      accent: "#F59E0B",
      accentForeground: "#451A03",
      ring: "#7C3AED",
      gradientEnabled: true,
      gradientFrom: "#4C1D95",
      gradientTo: "#F59E0B",
      gradientAngle: 120,
    },
  },
];

export function initThemeTokens() {
  applyTokens(loadStoredTokens());
}