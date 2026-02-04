import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const DateRangeFilter = ({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) => {
  const clearFilter = () => {
    onDateRangeChange(undefined);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-[280px]",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM yyyy", { locale: es })} -{" "}
                  {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={es}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {dateRange && (
        <Button variant="ghost" size="icon" onClick={clearFilter}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
