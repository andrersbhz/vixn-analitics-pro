import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsCard = ({ title, children, className }: AnalyticsCardProps) => (
  <Card className={cn("glass-card border-white/5 overflow-hidden", className)}>
    <CardHeader className="border-b border-white/5 bg-white/2 py-4 px-6">
      <CardTitle className="text-sm font-light uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      {children}
    </CardContent>
  </Card>
);
