import { Calendar, Users, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Claim } from "@/types/claim";

interface StatsCardsProps {
  claims: Claim[];
}

export const StatsCards = ({ claims }: StatsCardsProps) => {
  const today = new Date().toISOString().split("T")[0];
  const todayClaims = claims.filter((c) => c.fecha_cita === today);
  const uniqueServices = [...new Set(claims.map((c) => c.servicio))];
  const uniqueClients = [...new Set(claims.map((c) => c.email))];

  const stats = [
    {
      title: "Total Citas",
      value: claims.length,
      icon: Calendar,
      description: "Citas registradas",
    },
    {
      title: "Citas Hoy",
      value: todayClaims.length,
      icon: Clock,
      description: "Para hoy",
    },
    {
      title: "Servicios",
      value: uniqueServices.length,
      icon: FileText,
      description: "Tipos de servicio",
    },
    {
      title: "Clientes",
      value: uniqueClients.length,
      icon: Users,
      description: "Clientes únicos",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
