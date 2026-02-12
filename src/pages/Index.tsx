import { useState, useMemo, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClaims } from "@/hooks/useClaims";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClaimsChart } from "@/components/dashboard/ClaimsChart";
import { ServicesPieChart } from "@/components/dashboard/ServicesPieChart";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { ServicesLineChart } from "@/components/dashboard/ServicesLineChart";
import { ServicesByDayChart } from "@/components/dashboard/ServicesByDayChart";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { SearchFilter } from "@/components/dashboard/SearchFilter";
import { ClaimsTable } from "@/components/dashboard/ClaimsTable";
import { GeminiDocumentsCRUD } from "@/components/dashboard/GeminiDocumentsCRUD";
import { ExportPDFButton } from "@/components/dashboard/ExportPDFButton";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

const Index = () => {
  const { data: claims, isLoading, error, refetch, isFetching } = useClaims();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClaims = useMemo(() => {
    if (!claims) return [];
    
    let filtered = claims;

    // Filter by date range
    if (dateRange?.from) {
      filtered = filtered.filter((claim) => {
        const claimDate = parseISO(claim.fecha_cita);
        if (dateRange.to) {
          return isWithinInterval(claimDate, {
            start: dateRange.from!,
            end: dateRange.to,
          });
        }
        return claimDate >= dateRange.from!;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (claim) =>
          claim.nombre_titular.toLowerCase().includes(query) ||
          claim.email.toLowerCase().includes(query) ||
          claim.telefono.includes(query)
      );
    }

    return filtered;
  }, [claims, dateRange, searchQuery]);

  useEffect(() => {
    if (error && !claims) {
      toast.error("Error al cargar los datos. Se reintentará automáticamente.");
    }
  }, [error, claims]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex gap-2 items-center">
                <img src="/logo.png" alt="" width={50} height={50}/>
                <h1 className="font-bold">Panel de administración - CLAIM S.A.</h1>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="bg-card border">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="citas">Todas las Citas</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-card rounded-lg border">
              <SearchFilter value={searchQuery} onChange={setSearchQuery} />
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              {filteredClaims.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {filteredClaims.length} cita(s) encontrada(s)
                </span>
              )}
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[120px] rounded-lg" />
                  ))}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Skeleton className="h-[380px] rounded-lg" />
                  <Skeleton className="h-[380px] rounded-lg" />
                </div>
                <Skeleton className="h-[400px] rounded-lg" />
              </div>
            ) : (
              <>
                {filteredClaims.length > 0 && (
                  <div className="flex justify-end gap-2">
                    <ExportPDFButton
                      claims={filteredClaims}
                      fileName="graficas"
                      label="Exportar Gráficas a PDF"
                      mode="charts"
                      chartsContainerId="dashboard-charts"
                    />
                    <ExportPDFButton
                      claims={filteredClaims}
                      fileName="citas"
                      label="Exportar Citas a PDF"
                    />
                  </div>
                )}

                <div id="dashboard-charts" className="space-y-6 bg-background p-4">
                  <StatsCards claims={filteredClaims} />
                  
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ClaimsChart claims={filteredClaims} />
                    <WeeklyChart claims={filteredClaims} />
                  </div>

                  <ServicesByDayChart claims={filteredClaims} />

                  <div className="grid gap-6 lg:grid-cols-2">
                    <ServicesPieChart claims={filteredClaims} />
                    <ServicesLineChart claims={filteredClaims} />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="citas">
            {isLoading ? (
              <Skeleton className="h-[500px] rounded-lg" />
            ) : (
              <div id="claims-table" className="space-y-4">
                {filteredClaims.length > 0 && (
                  <div className="flex justify-end">
                    <ExportPDFButton
                      claims={filteredClaims}
                      fileName="citas"
                      label="Exportar Citas a PDF"
                    />
                  </div>
                )}
                <ClaimsTable claims={filteredClaims} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="documentos">
            <GeminiDocumentsCRUD />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
