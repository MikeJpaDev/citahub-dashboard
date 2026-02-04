import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Claim } from "@/types/claim";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ServicesByDayChartProps {
  claims: Claim[];
}

const BAR_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const ServicesByDayChart = ({ claims }: ServicesByDayChartProps) => {
  // Get unique services
  const services = [...new Set(claims.map((c) => c.servicio))];
  
  // Get unique dates sorted
  const dates = [...new Set(claims.map((c) => c.fecha_cita))].sort();

  // Build data: count per service per date
  const chartData = dates.map((date) => {
    const entry: Record<string, string | number> = {
      date: format(parseISO(date), "dd MMM", { locale: es }),
    };
    
    services.forEach((service) => {
      const count = claims.filter(
        (c) => c.servicio === service && c.fecha_cita === date
      ).length;
      entry[service] = count;
    });

    return entry;
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Servicios por Día
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {services.map((service, index) => (
                <Bar
                  key={service}
                  dataKey={service}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
