import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CatalogPlan = {
  id: string; name: string; slug: string; price: string; period: string;
  description: string | null; features: string[]; is_highlight: boolean;
  checkout_url: string | null; sort_order: number; is_active: boolean;
};
export type Product = {
  id: string; title: string; slug: string; short_description: string | null;
  description: string | null; price: number; image_url: string | null;
  category: string | null; checkout_url: string | null; sort_order: number; is_active: boolean;
};

// Tables are newer than generated types; use a loose client view.
export const db = supabase as unknown as { from: (t: string) => any };

export const usePlans = (all = false) =>
  useQuery({
    queryKey: ["catalog_plans", all],
    queryFn: async () => {
      let q = db.from("catalog_plans").select("*").order("sort_order");
      if (!all) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CatalogPlan[];
    },
  });

export const useProducts = (all = false) =>
  useQuery({
    queryKey: ["products", all],
    queryFn: async () => {
      let q = db.from("products").select("*").order("sort_order").order("created_at", { ascending: false });
      if (!all) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

export const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Crops/resizes an uploaded image to 1350x1080 JPEG data URL. */
export const toProductImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = 1350, H = 1080, c = document.createElement("canvas");
      c.width = W; c.height = H;
      const s = Math.max(W / img.width, H / img.height);
      const w = img.width * s, h = img.height * s;
      c.getContext("2d")!.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
