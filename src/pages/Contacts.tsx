import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, MessageSquare, CalendarClock, RefreshCw, Plus, Trash2, Mail, Phone, Building2 } from "lucide-react";

export interface Lead {
  id: string; name: string; email: string; phone: string | null; company: string | null;
  message: string | null; source: string; status: string; created_at: string;
}
export interface ContactMessage {
  id: string; name: string; email: string | null; subject: string | null; content: string;
  channel: string; is_read: boolean; created_at: string;
}
export interface Meeting {
  id: string; title: string; contact_name: string | null; contact_email: string | null;
  scheduled_at: string; duration_minutes: number; status: string; notes: string | null;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const Contacts = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMeeting, setNewMeeting] = useState({ title: "", contact_name: "", contact_email: "", scheduled_at: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [l, m, r] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("meetings").select("*").order("scheduled_at", { ascending: true }).limit(200),
    ]);
    if (l.error || m.error || r.error) {
      console.error("contacts load", l.error || m.error || r.error);
      toast.error("Não foi possível carregar os contatos.");
    }
    setLeads((l.data as Lead[]) || []);
    setMessages((m.data as ContactMessage[]) || []);
    setMeetings((r.data as Meeting[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error("Erro ao atualizar o lead.");
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const toggleRead = async (msg: ContactMessage) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: !msg.is_read }).eq("id", msg.id);
    if (error) return toast.error("Erro ao atualizar a mensagem.");
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m)));
  };

  const createMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.scheduled_at) {
      return toast.error("Informe título e data/hora.");
    }
    const { data, error } = await supabase.from("meetings").insert({
      title: newMeeting.title.trim(),
      contact_name: newMeeting.contact_name.trim() || null,
      contact_email: newMeeting.contact_email.trim() || null,
      scheduled_at: new Date(newMeeting.scheduled_at).toISOString(),
      notes: newMeeting.notes.trim() || null,
    }).select("*").maybeSingle();
    if (error) { console.error(error); return toast.error("Erro ao agendar a reunião."); }
    setMeetings((prev) => [...prev, data as Meeting].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)));
    setNewMeeting({ title: "", contact_name: "", contact_email: "", scheduled_at: "", notes: "" });
    toast.success("Reunião agendada.");
  };

  const deleteMeeting = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover a reunião.");
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const upcoming = meetings.filter((m) => new Date(m.scheduled_at) >= new Date());

  const stats = [
    { label: "Leads", value: leads.length, icon: Users, hint: `${leads.filter((l) => l.status === "novo").length} novos` },
    { label: "Mensagens", value: messages.length, icon: MessageSquare, hint: `${messages.filter((m) => !m.is_read).length} não lidas` },
    { label: "Reuniões", value: meetings.length, icon: CalendarClock, hint: `${upcoming.length} futuras` },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl">Contatos</h1>
            <p className="text-muted-foreground">Leads, mensagens e reuniões agendadas — salvos no banco de dados.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, hint }) => (
            <Card key={label} className="glass-card border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6 space-y-3">
            {leads.length === 0 && <p className="text-sm text-muted-foreground">Nenhum lead recebido ainda.</p>}
            {leads.map((l) => (
              <Card key={l.id} className="glass-card border-primary/10">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base">{l.name}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">{l.status}</Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase">{l.source}</Badge>
                    </div>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {l.email}</p>
                    {l.phone && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {l.phone}</p>}
                    {l.company && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="h-3 w-3" /> {l.company}</p>}
                    {l.message && <p className="max-w-2xl pt-2 text-sm text-muted-foreground">{l.message}</p>}
                    <p className="pt-1 text-[11px] text-muted-foreground">{fmt(l.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    {["novo", "em contato", "ganho", "perdido"].map((s) => (
                      <Button key={s} size="sm" variant={l.status === s ? "default" : "outline"} onClick={() => updateLeadStatus(l.id, s)} className="text-xs capitalize">
                        {s}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mensagens" className="mt-6 space-y-3">
            {messages.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma mensagem recebida ainda.</p>}
            {messages.map((m) => (
              <Card key={m.id} className={`glass-card ${m.is_read ? "border-white/5" : "border-primary/30"}`}>
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="text-base">{m.subject || "Mensagem"}</p>
                    <p className="text-xs text-muted-foreground">{m.name}{m.email ? ` · ${m.email}` : ""} · {fmt(m.created_at)}</p>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{m.content}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toggleRead(m)}>
                    {m.is_read ? "Marcar como não lida" : "Marcar como lida"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reunioes" className="mt-6 space-y-6">
            <Card className="glass-card border-primary/15">
              <CardHeader>
                <CardTitle className="text-lg">Agendar reunião</CardTitle>
                <CardDescription>Registre um compromisso com um contato.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createMeeting} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="m-title">Título *</Label>
                    <Input id="m-title" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-date">Data e hora *</Label>
                    <Input id="m-date" type="datetime-local" value={newMeeting.scheduled_at} onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_at: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-name">Contato</Label>
                    <Input id="m-name" value={newMeeting.contact_name} onChange={(e) => setNewMeeting({ ...newMeeting, contact_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-email">E-mail</Label>
                    <Input id="m-email" type="email" value={newMeeting.contact_email} onChange={(e) => setNewMeeting({ ...newMeeting, contact_email: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="m-notes">Observações</Label>
                    <Textarea id="m-notes" rows={3} value={newMeeting.notes} onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })} />
                  </div>
                  <Button type="submit" className="gap-2 md:w-fit"><Plus className="h-4 w-4" /> Agendar</Button>
                </form>
              </CardContent>
            </Card>

            {meetings.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma reunião agendada.</p>}
            {meetings.map((m) => (
              <Card key={m.id} className="glass-card border-primary/10">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div>
                    <p className="text-base">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(m.scheduled_at)} · {m.duration_minutes} min · {m.status}
                    </p>
                    {(m.contact_name || m.contact_email) && (
                      <p className="mt-1 text-xs text-muted-foreground">{m.contact_name} {m.contact_email ? `· ${m.contact_email}` : ""}</p>
                    )}
                    {m.notes && <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{m.notes}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteMeeting(m.id)} aria-label="Remover reunião">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
