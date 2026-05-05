import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AnalyticsCard = ({ title, children, className }: AnalyticsCardProps) => (
  <Card className={cn("glass-card border-white/5 overflow-hidden", className)}>
    <CardHeader className="border-b border-white/5 bg-white/5 py-4 px-6">
      <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      {children}
    </CardContent>
  </Card>
);
