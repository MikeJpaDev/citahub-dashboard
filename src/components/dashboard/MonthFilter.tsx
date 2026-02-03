import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Claim } from "@/types/claim";

interface MonthFilterProps {
  claims: Claim[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthFilter = ({ claims, selectedMonth, onMonthChange }: MonthFilterProps) => {
  // Get unique months from claims
  const months = [...new Set(claims.map((claim) => {
    const date = parseISO(claim.fecha_cita);
    return format(date, "yyyy-MM");
  }))].sort();

  const formatMonthLabel = (monthKey: string) => {
    const date = parseISO(`${monthKey}-01`);
    return format(date, "MMMM yyyy", { locale: es });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtrar por mes:</span>
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos los meses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los meses</SelectItem>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {formatMonthLabel(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
