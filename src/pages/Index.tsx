import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClaims } from "@/hooks/useClaims";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClaimsChart } from "@/components/dashboard/ClaimsChart";
import { ServicesPieChart } from "@/components/dashboard/ServicesPieChart";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { ServicesLineChart } from "@/components/dashboard/ServicesLineChart";
import { MonthFilter } from "@/components/dashboard/MonthFilter";
import { ClaimsTable } from "@/components/dashboard/ClaimsTable";
import { DocumentsCRUD } from "@/components/dashboard/DocumentsCRUD";
import { Skeleton } from "@/components/ui/skeleton";
import { parseISO, format } from "date-fns";

const Index = () => {
  const { data: claims, isLoading, error, refetch, isFetching } = useClaims();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const filteredClaims = useMemo(() => {
    if (!claims) return [];
    if (selectedMonth === "all") return claims;
    
    return claims.filter((claim) => {
      const claimMonth = format(parseISO(claim.fecha_cita), "yyyy-MM");
      return claimMonth === selectedMonth;
    });
  }, [claims, selectedMonth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg">Error al cargar los datos</p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Citas</h1>
              <p className="text-sm text-primary-foreground/80">
                Panel de administración - CLAIM S.A.
              </p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-card border">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="citas">Todas las Citas</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            {claims && claims.length > 0 && (
              <MonthFilter
                claims={claims}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            )}
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
            ) : filteredClaims.length > 0 ? (
              <>
                <StatsCards claims={filteredClaims} />
                
                {/* Row 1: Bar charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <ClaimsChart claims={filteredClaims} />
                  <WeeklyChart claims={filteredClaims} />
                </div>

                {/* Row 2: Pie chart and services evolution */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <ServicesPieChart claims={filteredClaims} />
                  <ServicesLineChart claims={filteredClaims} />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No hay datos para el período seleccionado
              </div>
            )}
          </TabsContent>

          <TabsContent value="citas">
            {isLoading ? (
              <Skeleton className="h-[500px] rounded-lg" />
            ) : filteredClaims.length > 0 ? (
              <ClaimsTable claims={filteredClaims} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No hay citas para el período seleccionado
              </div>
            )}
          </TabsContent>

          <TabsContent value="documentos">
            <DocumentsCRUD />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
