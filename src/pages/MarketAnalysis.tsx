import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { Search, Briefcase, TrendingUp, Users, Target, Rocket, Loader2, Sparkles, Globe, AlertCircle, BarChart3, PieChart, Info, ArrowUpRight, MessageCircle, Play, Share2, Megaphone, Filter, DollarSign, Zap, FileText, ImagePlus, X, Wand2, Download, Save, ShoppingBag, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

import { useConnections } from "@/hooks/use-connections";
import { useBrand } from "@/hooks/use-brand";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MarketAnalysis = () => {
  const { connections } = useConnections();
  const isAnyConnected = connections.some(c => c.isConnected);
  const { profile: brand } = useBrand();

  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [query, setQuery] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Ecommerce analysis
  const [ecomUrl, setEcomUrl] = useState("");
  const [ecomLoading, setEcomLoading] = useState(false);
  const [ecomResult, setEcomResult] = useState<any>(null);
  const [ecomError, setEcomError] = useState<string | null>(null);

  // Product knowledge → ad creatives
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState<Array<{ preview: string; data: string; mimeType: string; name: string }>>([]);
  const [generatingCreatives, setGeneratingCreatives] = useState(false);
  const [creativesResult, setCreativesResult] = useState<{ creatives: any[]; adCopies: any[] } | null>(null);
  const [creativesError, setCreativesError] = useState<string | null>(null);

  // Load saved study from ?studyId=
  useEffect(() => {
    const id = searchParams.get('studyId');
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('market_analyses').select('*').eq('id', id).maybeSingle();
      if (error || !data) return;
      setCurrentStudyId(data.id);
      setQuery(data.niche || '');
      setAnalysisResult(data.result || null);
      setAnalyzed(true);
      setTimeout(() => {
        document.getElementById('creatives-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    })();
  }, [searchParams]);

  const handleAnalyzeEcommerce = async () => {
    if (!ecomUrl) return;
    setEcomLoading(true);
    setEcomError(null);
    setEcomResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-ecommerce', { body: { url: ecomUrl } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEcomResult(data);
      // Pre-fill market query with detected niche/store to make it easy to run full study
      const suggested = data?.analysis?.storeName
        ? `${data.analysis.storeName}${data.analysis?.niche ? ' · ' + data.analysis.niche : ''}`
        : ecomUrl;
      setQuery(suggested);
    } catch (e: any) {
      setEcomError(e?.message || 'Falha ao analisar e-commerce');
    } finally {
      setEcomLoading(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!analysisResult) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Faça login para salvar');
      if (currentStudyId) {
        const { error } = await supabase.from('market_analyses').update({
          result: analysisResult, niche: query, updated_at: new Date().toISOString(),
        }).eq('id', currentStudyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('market_analyses').insert({
          user_id: userData.user.id, niche: query, prompt: null, model: 'gemini', result: analysisResult,
        }).select().single();
        if (error) throw error;
        setCurrentStudyId(data.id);
      }
      toast({ title: 'Estratégia salva', description: 'Disponível na página Estratégia.' });
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Auto-save analyses and strategies to the database whenever result changes
  useEffect(() => {
    if (!analysisResult) return;
    const t = setTimeout(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        const payload = {
          user_id: userData.user.id,
          niche: query || 'Estudo sem título',
          prompt: null,
          model: 'gemini',
          result: { ...analysisResult, ecommerce: ecomResult?.analysis ?? null, creatives: creativesResult ?? null },
          updated_at: new Date().toISOString(),
        };
        if (currentStudyId) {
          await supabase.from('market_analyses').update(payload).eq('id', currentStudyId);
        } else {
          const { data } = await supabase.from('market_analyses').insert(payload).select().single();
          if (data?.id) setCurrentStudyId(data.id);
        }
      } catch (e) {
        console.warn('auto-save falhou', e);
      }
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResult, ecomResult, creativesResult]);

  const handleExportPDF = async () => {
    if (!analysisResult) return;
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;
      const brandName = brand.brandName || 'GrowthSuite Pro';
      const brandColor: [number, number, number] = [124, 58, 237];

      const drawHeader = async (title: string) => {
        // Colored accent band
        doc.setFillColor(...brandColor);
        doc.rect(0, 0, pageW, 4, 'F');
        // Logo top-left
        try {
          if (brand.logoUrl) {
            const dataUrl = brand.logoUrl.startsWith('data:')
              ? brand.logoUrl
              : await fetch(brand.logoUrl).then(r => r.blob()).then(b => new Promise<string>(res => { const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.readAsDataURL(b); }));
            const fmt = dataUrl.includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(dataUrl, fmt, margin, 18, 42, 42);
          }
        } catch {}
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text(brandName, margin + (brand.logoUrl ? 52 : 0), 36);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text('Plano Estratégico de Mercado', margin + (brand.logoUrl ? 52 : 0), 52);
        // Right side date
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(new Date().toLocaleDateString('pt-BR'), pageW - margin, 36, { align: 'right' });
        // Divider
        doc.setDrawColor(230);
        doc.line(margin, 70, pageW - margin, 70);
        // Section title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...brandColor);
        doc.text(title, margin, 96);
      };

      const drawFooter = () => {
        const pages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`${brandName} · Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageH - 20);
          doc.text(`Página ${i} de ${pages}`, pageW - margin, pageH - 20, { align: 'right' });
        }
      };

      await drawHeader(query || 'Análise de Mercado');

      let y = 120;
      const addSection = (title: string) => {
        if (y > pageH - 120) { doc.addPage(); y = 60; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...brandColor);
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(...brandColor);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 60, y);
        y += 14;
      };
      const addText = (label: string, value?: string) => {
        if (!value) return;
        if (y > pageH - 100) { doc.addPage(); y = 60; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(90);
        doc.text(label.toUpperCase(), margin, y);
        y += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40);
        const lines = doc.splitTextToSize(String(value), pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 12 + 6;
      };

      // Resumo
      addSection('Resumo Executivo');
      autoTable(doc, {
        startY: y,
        theme: 'grid',
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: brandColor, textColor: 255 },
        head: [['Tamanho do Mercado', 'Competitividade', 'CAC Médio']],
        body: [[analysisResult.marketSize || '-', analysisResult.competitiveness || '-', analysisResult.avgCac || '-']],
      });
      y = (doc as any).lastAutoTable.finalY + 20;

      addText('Oportunidade', analysisResult.opportunity);
      addText('Tendências', analysisResult.trends);
      addText('Canais Recomendados', analysisResult.channels);

      // Plataformas
      const platforms: Array<[string, string]> = [
        ['Google Ads', 'googleAds'],
        ['Instagram / Facebook Ads', 'instagramAds'],
        ['TikTok Ads', 'tiktokAds'],
        ['LinkedIn Ads', 'linkedinAds'],
      ];
      addSection('Estratégias por Plataforma');
      for (const [label, key] of platforms) {
        const d = analysisResult[key] || {};
        const rows: string[][] = [];
        ['objective','audience','strategy','creative','hook','headline','body','caption','script','format','cta','budget','kpi'].forEach(f => {
          if (d[f]) rows.push([f, String(d[f])]);
        });
        if (Array.isArray(d.keywords) && d.keywords.length) rows.push(['keywords', d.keywords.join(', ')]);
        if (Array.isArray(d.headlines) && d.headlines.length) rows.push(['headlines', d.headlines.join(' | ')]);
        if (Array.isArray(d.descriptions) && d.descriptions.length) rows.push(['descriptions', d.descriptions.join(' | ')]);
        if (!rows.length) continue;
        if (y > pageH - 120) { doc.addPage(); y = 60; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30);
        doc.text(label, margin, y); y += 8;
        autoTable(doc, {
          startY: y,
          theme: 'striped',
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: { fillColor: [40, 40, 60], textColor: 255 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 90, textColor: brandColor as any } },
          head: [['Item', 'Detalhe']],
          body: rows,
        });
        y = (doc as any).lastAutoTable.finalY + 16;
      }

      // Copies
      if (Array.isArray(analysisResult.copyModels) && analysisResult.copyModels.length) {
        if (y > pageH - 150) { doc.addPage(); y = 60; }
        addSection('Modelos de Copy');
        autoTable(doc, {
          startY: y,
          theme: 'grid',
          margin: { left: margin, right: margin },
          styles: { fontSize: 9, cellPadding: 6, valign: 'top' },
          headStyles: { fillColor: brandColor, textColor: 255 },
          head: [['Framework', 'Headline', 'Body', 'CTA']],
          body: analysisResult.copyModels.map((c: any) => [c.framework || '', c.headline || '', c.body || '', c.cta || '']),
        });
        y = (doc as any).lastAutoTable.finalY + 20;
      }

      // Funil
      if (analysisResult.salesFunnel && Object.keys(analysisResult.salesFunnel).length) {
        if (y > pageH - 180) { doc.addPage(); y = 60; }
        addSection('Funil de Vendas');
        const funnelRows: string[][] = [];
        const labels: Record<string, string> = { topo: 'Topo · Atração', meio: 'Meio · Consideração', fundo: 'Fundo · Conversão', posVenda: 'Pós-Venda · Retenção' };
        Object.entries(labels).forEach(([k, lbl]) => {
          const s = (analysisResult.salesFunnel as any)[k];
          if (!s) return;
          funnelRows.push([lbl, s.objetivo || '', Array.isArray(s.canais) ? s.canais.join(', ') : '', s.oferta || '', s.copy || '', s.kpi || '']);
        });
        autoTable(doc, {
          startY: y,
          theme: 'grid',
          margin: { left: margin, right: margin },
          styles: { fontSize: 8.5, cellPadding: 5, valign: 'top' },
          headStyles: { fillColor: brandColor, textColor: 255 },
          head: [['Etapa', 'Objetivo', 'Canais', 'Oferta', 'Copy', 'KPI']],
          body: funnelRows,
        });
        y = (doc as any).lastAutoTable.finalY + 12;
      }

      drawFooter();
      const fname = `plano-${(query || 'estrategia').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.pdf`;
      doc.save(fname);
      toast({ title: 'PDF exportado', description: fname });
    } catch (e: any) {
      toast({ title: 'Falha ao exportar', description: e?.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4 - productImages.length);
    const converted = await Promise.all(arr.map(f => new Promise<{ preview: string; data: string; mimeType: string; name: string }>((resolve, reject) => {
      if (f.size > 4 * 1024 * 1024) return reject(new Error('imagem >4MB'));
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const [, base64 = ''] = result.split(',');
        resolve({ preview: result, data: base64, mimeType: f.type || 'image/png', name: f.name });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(f);
    })));
    setProductImages(prev => [...prev, ...converted]);
  };

  const handleGenerateCreatives = async () => {
    if (!productName || !productDescription) return;
    setGeneratingCreatives(true);
    setCreativesError(null);
    setCreativesResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-creatives', {
        body: {
          productName,
          productDescription,
          niche: query,
          images: productImages.map(i => ({ data: i.data, mimeType: i.mimeType })),
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCreativesResult(data);
    } catch (e: any) {
      setCreativesError(e?.message || 'Falha ao gerar criativos');
    } finally {
      setGeneratingCreatives(false);
    }
  };

  const handleAnalyze = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const systemPrompt = `Você é um especialista sênior em marketing digital, growth e copywriting de resposta direta.
      Realize uma análise de mercado PROFUNDA e ACIONÁVEL para o nicho ou empresa: ${query}.
      Sua resposta DEVE ser um objeto JSON puro (sem markdown, sem comentários) com ESTA estrutura EXATA:
      {
        "marketSize": "string",
        "competitiveness": "string",
        "avgCac": "string",
        "opportunity": "string",
        "trends": "string",
        "projections": [{"name":"Mês 1","value":number}, ... 6 meses],
        "distribution": [{"name":"Orgânico","value":number},{"name":"Pago","value":number},{"name":"Social","value":number}],
        "channels": "string",
        "googleAds": {"strategy":"string","objective":"string","audience":"string","keywords":["string"],"headlines":["string","string","string"],"descriptions":["string","string"],"budget":"string","kpi":"string"},
        "instagramAds": {"strategy":"string","objective":"string","audience":"string","creative":"string","hook":"string","caption":"string","cta":"string","budget":"string","kpi":"string"},
        "tiktokAds": {"strategy":"string","objective":"string","audience":"string","creative":"string","hook":"string","script":"string","cta":"string","budget":"string","kpi":"string"},
        "linkedinAds": {"strategy":"string","objective":"string","audience":"string","format":"string","headline":"string","body":"string","cta":"string","budget":"string","kpi":"string"},
        "copyModels": [
          {"framework":"AIDA","headline":"string","body":"string","cta":"string"},
          {"framework":"PAS (Problema-Agitação-Solução)","headline":"string","body":"string","cta":"string"},
          {"framework":"BAB (Antes-Depois-Ponte)","headline":"string","body":"string","cta":"string"},
          {"framework":"4Ps (Promessa-Prova-Proposta-Push)","headline":"string","body":"string","cta":"string"}
        ],
        "salesFunnel": {
          "topo": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"},
          "meio": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"},
          "fundo": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"},
          "posVenda": {"objetivo":"string","canais":["string"],"conteudo":"string","oferta":"string","kpi":"string","copy":"string"}
        }
      }
      Escreva em português do Brasil, tom persuasivo e específico ao nicho. Responda APENAS o JSON.`;

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          prompt: systemPrompt,
          model: 'gemini',
          system_prompt: "Você é um analista de marketing sênior que fornece dados em JSON puro."
        }
      });

      if (error) throw error;
      
      // Try to parse JSON from AI response
      let result;
      try {
        result = JSON.parse(data.text.replace(/```json|```/g, ''));
      } catch (e) {
        result = {
          marketSize: "Análise concluída",
          competitiveness: "Alta",
          avgCac: "Variável",
          opportunity: data.text.substring(0, 200),
          trends: "Crescimento constante",
          adsStrategy: "Focar em autoridade",
          channels: "Google e Facebook"
        };
      }
      
      // Fallback for missing nested objects
      if (!result.googleAds) result.googleAds = { strategy: result.adsStrategy || "Focar em pesquisa", keywords: [], budget: "R$ 50/dia" };
      if (!result.facebookAds) result.facebookAds = { strategy: "Remarketing e Lookalike", creative: "Vídeos curtos", budget: "R$ 30/dia" };
      if (!result.tiktokAds) result.tiktokAds = { strategy: "Trends e Influenciadores", creative: "UGC (User Generated Content)", budget: "R$ 20/dia" };
      if (!result.linkedinAds) result.linkedinAds = { strategy: "ABM e Conteúdo Educativo", audience: "Decisores B2B", budget: "R$ 100/dia" };
      if (!result.instagramAds && result.facebookAds) result.instagramAds = result.facebookAds;
      if (!result.copyModels) result.copyModels = [];
      if (!result.salesFunnel) result.salesFunnel = {};
      
      setAnalysisResult(result);
      setAnalyzed(true);

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('market_analyses').insert({
            user_id: userData.user.id,
            niche: query,
            prompt: systemPrompt,
            model: 'gemini',
            result,
          });
        }
      } catch (e) {
        console.warn('Falha ao salvar análise:', e);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  const platformStyles: Record<string, { bg: string; border: string; text: string; chip: string; chipText: string }> = {
    blue:    { bg: 'bg-blue-500/5',    border: 'border-blue-500/10',    text: 'text-blue-400',    chip: 'bg-blue-500/10 border-blue-500/20',       chipText: 'text-blue-300' },
    pink:    { bg: 'bg-pink-500/5',    border: 'border-pink-500/10',    text: 'text-pink-400',    chip: 'bg-pink-500/10 border-pink-500/20',       chipText: 'text-pink-300' },
    fuchsia: { bg: 'bg-fuchsia-500/5', border: 'border-fuchsia-500/10', text: 'text-fuchsia-400', chip: 'bg-fuchsia-500/10 border-fuchsia-500/20', chipText: 'text-fuchsia-300' },
    indigo:  { bg: 'bg-indigo-500/5',  border: 'border-indigo-500/10',  text: 'text-indigo-400',  chip: 'bg-indigo-500/10 border-indigo-500/20',   chipText: 'text-indigo-300' },
  };

  const funnelStyles: Record<string, { grad: string; border: string; text: string; textSoft: string; chip: string; chipText: string }> = {
    cyan:    { grad: 'from-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    textSoft: 'text-cyan-300',    chip: 'bg-cyan-500/10 border-cyan-500/20',    chipText: 'text-cyan-200' },
    purple:  { grad: 'from-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  textSoft: 'text-purple-300',  chip: 'bg-purple-500/10 border-purple-500/20',  chipText: 'text-purple-200' },
    emerald: { grad: 'from-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', textSoft: 'text-emerald-300', chip: 'bg-emerald-500/10 border-emerald-500/20', chipText: 'text-emerald-200' },
    amber:   { grad: 'from-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   textSoft: 'text-amber-300',   chip: 'bg-amber-500/10 border-amber-500/20',   chipText: 'text-amber-200' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Globe className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extralight text-foreground tracking-tight">Estudo de Mercado</h1>
            <p className="text-muted-foreground mt-1 font-light italic opacity-80">Análise completa de nichos e empresas para estratégias vencedoras.</p>
          </div>
        </div>

        <AnalyticsCard title="Analisar E-commerce (URL)">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://sualoja.com.br"
                className="pl-10 h-11 bg-accent/20 border-accent"
                value={ecomUrl}
                onChange={(e) => setEcomUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAnalyzeEcommerce}
              disabled={ecomLoading || !ecomUrl}
              className="h-11 px-6 bg-cyan-600 hover:bg-cyan-700"
            >
              {ecomLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
              {ecomLoading ? 'Analisando loja...' : 'Analisar Loja'}
            </Button>
          </div>
          {ecomError && <div className="mt-3 text-xs text-red-400 flex items-center gap-2"><AlertCircle className="h-3 w-3" />{ecomError}</div>}
          {ecomResult?.analysis && (
            <div className="mt-5 grid gap-3 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {ecomResult.analysis.storeName && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Loja / Nicho</div>
                  <div className="text-sm text-foreground">{ecomResult.analysis.storeName} · <span className="text-muted-foreground">{ecomResult.analysis.niche}</span></div>
                </div>
              )}
              {ecomResult.analysis.positioning && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Posicionamento</div>
                  <div className="text-sm text-foreground/85">{ecomResult.analysis.positioning}</div>
                </div>
              )}
              {ecomResult.analysis.targetAudience && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-1">Público-alvo</div>
                  <div className="text-sm text-foreground/85">{ecomResult.analysis.targetAudience}</div>
                </div>
              )}
              {['strengths','weaknesses','opportunities','quickWins'].map((k) => (
                Array.isArray(ecomResult.analysis[k]) && ecomResult.analysis[k].length > 0 && (
                  <div key={k} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase tracking-widest text-cyan-300 mb-2">
                      {k === 'strengths' ? 'Forças' : k === 'weaknesses' ? 'Fraquezas' : k === 'opportunities' ? 'Oportunidades' : 'Quick Wins'}
                    </div>
                    <ul className="space-y-1 text-[0.82rem] text-foreground/80 list-disc list-inside">
                      {ecomResult.analysis[k].map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )
              ))}
              <div className="md:col-span-2">
                <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Gerar Estratégia Completa com base nesta análise
                </Button>
              </div>
            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard title="Nova Pesquisa de Mercado">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Ex: Nicho de Pets de Luxo ou Nome da Empresa Concorrente" 
                className="pl-10 h-12 bg-accent/20 border-accent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button 
              className="h-12 px-8 bg-purple-600 hover:bg-purple-700 font-semibold"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {loading ? "Analisando..." : "Solicitar Estudo Completo"}
            </Button>
          </div>
        </AnalyticsCard>

        {/* Conhecimento do Produto → Criativos com IA */}
        <div id="creatives-panel" />
        <AnalyticsCard title="Conhecimento do Produto · Gerador de Criativos com IA">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Nome do Produto</label>
                <Input
                  placeholder="Ex: Tênis Runner X Pro"
                  className="mt-1 bg-accent/20 border-accent"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Descrição / Diferenciais</label>
                <Textarea
                  placeholder="Fale sobre benefícios, público, dor que resolve, prova social, preço, garantias..."
                  className="mt-1 bg-accent/20 border-accent min-h-[120px] text-sm"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerateCreatives}
                disabled={generatingCreatives || !productName || !productDescription}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generatingCreatives ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {generatingCreatives ? "Gerando criativos..." : "Gerar Criativos com IA"}
              </Button>
              {creativesError && (
                <div className="text-xs text-red-400 flex items-center gap-2"><AlertCircle className="h-3 w-3" />{creativesError}</div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Imagens de Referência (até 4, opcional)</label>
              <div className="mt-1 grid grid-cols-4 gap-2">
                {productImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                    <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProductImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {productImages.length < 4 && (
                  <label className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground mt-1">adicionar</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-2">A IA usará as imagens + nome + descrição para criar 4 conceitos visuais e copies prontas para Google, Meta, TikTok e LinkedIn.</p>
            </div>
          </div>

          {creativesResult && (
            <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {Array.isArray(creativesResult.creatives) && creativesResult.creatives.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-purple-300 mb-3 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Modelos de Criativos Gerados
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {creativesResult.creatives.map((c: any, i: number) => (
                      <div key={i} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex flex-col">
                        {c.imageUrl ? (
                          <div className="relative">
                            <img src={c.imageUrl} alt={c.style} className="w-full aspect-square object-cover" />
                            <a
                              href={c.imageUrl}
                              download={`criativo-${i + 1}.png`}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur hover:bg-black/80 transition"
                            >
                              <Download className="h-3 w-3 text-white" />
                            </a>
                          </div>
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-red-500/5 text-red-400 text-[10px] p-3 text-center">
                            {c.error || 'Falha ao gerar imagem'}
                          </div>
                        )}
                        <div className="p-3 flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{c.style}</span>
                          <p className="text-[0.78rem] text-muted-foreground leading-snug">{c.concept}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(creativesResult.adCopies) && creativesResult.adCopies.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-purple-300 mb-3 flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Copies Prontas por Plataforma
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {creativesResult.adCopies.map((c: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{c.platform}</span>
                        {c.headline && <div className="text-[0.9rem] font-medium text-foreground">{c.headline}</div>}
                        {c.hook && <div className="text-[0.85rem] italic text-foreground/80">"{c.hook}"</div>}
                        {(c.description || c.primaryText || c.script || c.body) && (
                          <p className="text-[0.8rem] text-muted-foreground leading-relaxed whitespace-pre-line">
                            {c.description || c.primaryText || c.script || c.body}
                          </p>
                        )}
                        {c.cta && (
                          <span className="mt-1 inline-flex self-start items-center gap-1 text-[0.72rem] px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/30">
                            <Zap className="h-3 w-3" /> {c.cta}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </AnalyticsCard>

        {analyzed && !isAnyConnected && (
           <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
             <AlertCircle className="h-5 w-5 text-amber-500" />
             <p className="text-sm text-amber-600 font-medium">
               Aviso: Nenhuma plataforma conectada. A análise está sendo feita com base em dados genéricos de mercado.
             </p>
           </div>
        )}

        {analyzed && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-end">
                <Button onClick={handleSaveStrategy} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {currentStudyId ? 'Atualizar Estratégia Salva' : 'Salvar Estratégia'}
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-glass flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">Tamanho do Mercado</span>
                  <span className="font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.marketSize}</span>
                </div>
                <div className="p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-glass flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">Competitividade</span>
                  <span className="text-xl font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.competitiveness}</span>
                </div>
                <div className="p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-glass flex flex-col gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">CAC Médio</span>
                  <span className="text-xl font-light text-foreground" style={{ fontSize: '0.9rem' }}>{analysisResult?.avgCac}</span>
                </div>
              </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AnalyticsCard title="Projeção de Crescimento (6 Meses)">
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysisResult?.projections || []}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Distribuição de Canais Sugerida">
                <div className="h-[250px] w-full mt-4 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={analysisResult?.distribution || []}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(analysisResult?.distribution || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 ml-4">
                    {(analysisResult?.distribution || []).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-[10px] text-muted-foreground">{entry.name}: {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnalyticsCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCard title="Análise Estratégica" className="h-full">
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-[11px] font-semibold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-3">
                      <Target className="h-4 w-4" /> Oportunidade
                    </h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '0.9rem' }}>
                      {analysisResult?.opportunity}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-[11px] font-semibold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-3">
                      <TrendingUp className="h-4 w-4" /> Tendências
                    </h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '0.9rem' }}>
                      {analysisResult?.trends}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <h4 className="text-[11px] font-semibold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-3">
                      <Info className="h-4 w-4" /> Canais Recomendados
                    </h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '0.9rem' }}>
                      {analysisResult?.channels}
                    </p>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Estratégias por Plataforma (Ads)">
                <div className="grid gap-4">
                  <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Google Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.googleAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.googleAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-blue-600/5 rounded-xl border border-blue-600/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Facebook / Instagram</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.facebookAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.facebookAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-pink-500/5 rounded-xl border border-pink-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-pink-400" />
                        <span className="text-[10px] font-bold text-pink-400 uppercase">TikTok Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.tiktokAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.tiktokAds?.strategy}</p>
                  </div>

                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">LinkedIn Ads</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{analysisResult?.linkedinAds?.budget}</span>
                    </div>
                    <p className="text-foreground/80 text-[0.85rem] leading-tight">{analysisResult?.linkedinAds?.strategy}</p>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
                <Button
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                  onClick={handleExportPDF}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {exporting ? 'Gerando PDF...' : 'Exportar Plano Completo (PDF)'}
                </Button>
              </AnalyticsCard>
            </div>

            {/* Estratégias detalhadas por plataforma */}
            <AnalyticsCard title="Estratégias Detalhadas de Ads por Plataforma">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: 'googleAds', label: 'Google Ads', color: 'blue', icon: Search },
                  { key: 'instagramAds', label: 'Instagram / Facebook Ads', color: 'pink', icon: Share2 },
                  { key: 'tiktokAds', label: 'TikTok Ads', color: 'fuchsia', icon: Play },
                  { key: 'linkedinAds', label: 'LinkedIn Ads', color: 'indigo', icon: Briefcase },
                ].map(({ key, label, color, icon: Icon }) => {
                  const d = analysisResult?.[key] || {};
                  const st = platformStyles[color];
                  return (
                    <div key={key} className={`p-4 rounded-xl ${st.bg} border ${st.border} flex flex-col gap-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${st.text}`} />
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${st.text}`}>{label}</span>
                        </div>
                        {d.budget && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />{d.budget}</span>}
                      </div>
                      {d.objective && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Objetivo · </span><span className="text-foreground/80">{d.objective}</span></div>}
                      {d.audience && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Público · </span><span className="text-foreground/80">{d.audience}</span></div>}
                      {d.strategy && <p className="text-foreground/80 text-[0.85rem] leading-snug">{d.strategy}</p>}
                      {Array.isArray(d.keywords) && d.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {d.keywords.slice(0, 8).map((k: string, i: number) => (
                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${st.chip} ${st.chipText}`}>{k}</span>
                          ))}
                        </div>
                      )}
                      {Array.isArray(d.headlines) && d.headlines.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Títulos</span>
                          {d.headlines.map((h: string, i: number) => (
                            <div key={i} className="text-[0.8rem] text-foreground/80 border-l-2 border-white/10 pl-2">{h}</div>
                          ))}
                        </div>
                      )}
                      {(d.hook || d.script || d.body || d.caption) && (
                        <div className="space-y-1">
                          {d.hook && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Hook · </span><span className="text-foreground/80 italic">"{d.hook}"</span></div>}
                          {(d.script || d.body || d.caption) && <p className="text-[0.8rem] text-foreground/70 leading-snug">{d.script || d.body || d.caption}</p>}
                        </div>
                      )}
                      {d.creative && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Criativo · </span><span className="text-foreground/80">{d.creative}</span></div>}
                      {d.format && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">Formato · </span><span className="text-foreground/80">{d.format}</span></div>}
                      {d.cta && <div className="text-[0.8rem]"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider">CTA · </span><span className="text-foreground/80 font-medium">{d.cta}</span></div>}
                      {d.kpi && <div className="text-[0.75rem] text-emerald-400/80 flex items-center gap-1"><Target className="h-3 w-3" />{d.kpi}</div>}
                    </div>
                  );
                })}
              </div>
            </AnalyticsCard>

            {/* Modelos de Copy */}
            {Array.isArray(analysisResult?.copyModels) && analysisResult.copyModels.length > 0 && (
              <AnalyticsCard title="Modelos de Copy Prontos">
                <div className="grid gap-4 md:grid-cols-2">
                  {analysisResult.copyModels.map((c: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">{c.framework}</span>
                      </div>
                      {c.headline && <div className="text-[0.9rem] font-medium text-foreground">{c.headline}</div>}
                      {c.body && <p className="text-[0.82rem] text-muted-foreground leading-relaxed whitespace-pre-line">{c.body}</p>}
                      {c.cta && (
                        <div className="mt-1 inline-flex self-start items-center gap-1 text-[0.75rem] px-3 py-1 rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/30">
                          <Zap className="h-3 w-3" /> {c.cta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AnalyticsCard>
            )}

            {/* Funil de Vendas */}
            {analysisResult?.salesFunnel && Object.keys(analysisResult.salesFunnel).length > 0 && (
              <AnalyticsCard title="Funil de Vendas Matador">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { key: 'topo', label: 'Topo · Atração', color: 'cyan', icon: Users },
                    { key: 'meio', label: 'Meio · Consideração', color: 'purple', icon: Filter },
                    { key: 'fundo', label: 'Fundo · Conversão', color: 'emerald', icon: Target },
                    { key: 'posVenda', label: 'Pós-Venda · Retenção', color: 'amber', icon: Rocket },
                  ].map(({ key, label, color, icon: Icon }) => {
                    const s = analysisResult.salesFunnel[key];
                    if (!s) return null;
                    const st = funnelStyles[color];
                    return (
                      <div key={key} className={`p-4 rounded-2xl bg-gradient-to-b ${st.grad} to-transparent border ${st.border} flex flex-col gap-3`}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${st.text}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${st.textSoft}`}>{label}</span>
                        </div>
                        {s.objetivo && <div className="text-[0.82rem] text-foreground/85"><span className="text-muted-foreground/70 uppercase text-[9px] tracking-wider block mb-0.5">Objetivo</span>{s.objetivo}</div>}
                        {Array.isArray(s.canais) && s.canais.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.canais.map((c: string, i: number) => (
                              <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full border ${st.chip} ${st.chipText}`}>{c}</span>
                            ))}
                          </div>
                        )}
                        {s.conteudo && <div className="text-[0.8rem] text-muted-foreground"><span className="text-muted-foreground/60 uppercase text-[9px] tracking-wider block mb-0.5">Conteúdo</span>{s.conteudo}</div>}
                        {s.oferta && <div className="text-[0.8rem] text-muted-foreground"><span className="text-muted-foreground/60 uppercase text-[9px] tracking-wider block mb-0.5">Oferta</span>{s.oferta}</div>}
                        {s.copy && <div className="text-[0.78rem] italic text-foreground/70 border-l-2 border-white/10 pl-2">"{s.copy}"</div>}
                        {s.kpi && <div className={`text-[0.72rem] ${st.textSoft} flex items-center gap-1 mt-auto`}><Target className="h-3 w-3" />{s.kpi}</div>}
                      </div>
                    );
                  })}
                </div>
              </AnalyticsCard>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketAnalysis;
