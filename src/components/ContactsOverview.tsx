import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, MessageSquare, CalendarClock, ArrowUpRight } from "lucide-react";

interface Lead { id: string; name: string; email: string; status: string; created_at: string }
interface Msg { id: string; name: string; subject: string | null; content: string; is_read: boolean; created_at: string }
interface Meeting { id: string; title: string; contact_name: string | null; scheduled_at: string }

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const ContactsOverview = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;
      const [l, m, r] = await Promise.all([
        supabase.from("leads").select("id,name,email,status,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("contact_messages").select("id,name,subject,content,is_read,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("meetings").select("id,title,contact_name,scheduled_at").gte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(50),
      ]);
      if (!active) return;
      setLeads((l.data as Lead[]) || []);
      setMessages((m.data as Msg[]) || []);
      setMeetings((r.data as Meeting[]) || []);
    })();
    return () => { active = false; };
  }, []);

  const blocks = [
    {
      title: "Leads",
      icon: Users,
      total: leads.length,
      hint: `${leads.filter((l) => l.status === "novo").length} novos`,
      rows: leads.slice(0, 4).map((l) => ({ id: l.id, main: l.name, sub: `${l.email} · ${fmt(l.created_at)}` })),
      empty: "Nenhum lead recebido ainda.",
    },
    {
      title: "Mensagens",
      icon: MessageSquare,
      total: messages.length,
      hint: `${messages.filter((m) => !m.is_read).length} não lidas`,
      rows: messages.slice(0, 4).map((m) => ({ id: m.id, main: m.subject || m.name, sub: m.content.slice(0, 70) })),
      empty: "Nenhuma mensagem recebida.",
    },
    {
      title: "Reuniões agendadas",
      icon: CalendarClock,
      total: meetings.length,
      hint: "próximas",
      rows: meetings.slice(0, 4).map((m) => ({ id: m.id, main: m.title, sub: `${m.contact_name || "—"} · ${fmt(m.scheduled_at)}` })),
      empty: "Nenhuma reunião agendada.",
    },
  ];

  return (
    <Card className="glass-card border-white/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-light">Contatos</CardTitle>
          <CardDescription>Leads, mensagens e reuniões vindos da landing page.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/contatos">Ver todos <ArrowUpRight className="h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {blocks.map(({ title, icon: Icon, total, hint, rows, empty }) => (
          <div key={title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{title}</span>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-light">{total}</p>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
            <div className="mt-3 space-y-2">
              {rows.length === 0 ? (
                <p className="text-xs text-muted-foreground">{empty}</p>
              ) : (
                rows.map((r) => (
                  <div key={r.id} className="rounded-lg bg-white/5 p-2">
                    <p className="line-clamp-1 text-xs">{r.main}</p>
                    <p className="line-clamp-1 text-[10px] text-muted-foreground">{r.sub}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContactsOverview;
