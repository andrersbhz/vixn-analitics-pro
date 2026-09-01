import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import brandIcon from "@/assets/brand-icon.png";

export interface BrandProfile {
  brandName: string;
  logoUrl: string;
  fullName: string;
  email: string;
}

const DEFAULTS: BrandProfile = {
  brandName: "VYXN Digital",
  logoUrl: brandIcon,
  fullName: "",
  email: "",
};

const LS_KEY = "app_brand_profile";

const readLocal = (): BrandProfile => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    localStorage.removeItem(LS_KEY);
  }
  return DEFAULTS;
};

export const useBrand = () => {
  const [profile, setProfile] = useState<BrandProfile>(readLocal);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const local = readLocal();
    setProfile(local);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const user = auth?.session?.user;
      if (!user) { setLoading(false); return; }

      const [{ data: prof }, { data: settings }] = await Promise.all([
        supabase.from("profiles").select("full_name,email,avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("user_settings").select("preferences").eq("user_id", user.id).maybeSingle(),
      ]);

      const prefs = (settings?.preferences as Record<string, unknown> | null) || {};
      const merged: BrandProfile = {
        brandName: (typeof prefs.brandName === "string" && prefs.brandName) || local.brandName || DEFAULTS.brandName,
        logoUrl: (typeof prefs.logoUrl === "string" && prefs.logoUrl) || prof?.avatar_url || local.logoUrl || DEFAULTS.logoUrl,
        fullName: prof?.full_name || local.fullName || "",
        email: prof?.email || user.email || "",
      };
      setProfile(merged);
      localStorage.setItem(LS_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn("useBrand load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (next: Partial<BrandProfile>) => {
    const merged = { ...profile, ...next };
    setProfile(merged);
    localStorage.setItem(LS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("brand:updated", { detail: merged }));

    const { data: auth } = await supabase.auth.getSession();
    const user = auth?.session?.user;
    if (!user) return { ok: false, reason: "not_authenticated" as const };

    const { error: pErr } = await supabase.from("profiles").upsert({
      id: user.id,
      email: merged.email || user.email!,
      full_name: merged.fullName || null,
      avatar_url: merged.logoUrl || null,
      updated_at: new Date().toISOString(),
    });

    const { data: currentSettings } = await supabase
      .from("user_settings")
      .select("preferences")
      .eq("user_id", user.id)
      .maybeSingle();
    const currentPreferences = (currentSettings?.preferences as Record<string, unknown> | null) || {};

    const { error: sErr } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      preferences: { ...currentPreferences, brandName: merged.brandName, logoUrl: merged.logoUrl },
      updated_at: new Date().toISOString(),
    });

    if (pErr || sErr) return { ok: false, reason: (pErr || sErr)?.message };
    return { ok: true as const };
  }, [profile]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Partial<BrandProfile>>).detail;
      setProfile((current) => ({ ...current, ...detail }));
    };
    window.addEventListener("brand:updated", handler);
    return () => window.removeEventListener("brand:updated", handler);
  }, []);

  return { profile, loading, save, reload: load };
};
