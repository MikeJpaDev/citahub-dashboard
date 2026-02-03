import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClaims } from "@/hooks/useClaims";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClaimsChart } from "@/components/dashboard/ClaimsChart";
import { ServicesPieChart } from "@/components/dashboard/ServicesPieChart";
import { ClaimsTable } from "@/components/dashboard/ClaimsTable";
import { DocumentsCRUD } from "@/components/dashboard/DocumentsCRUD";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: claims, isLoading, error, refetch, isFetching } = useClaims();

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
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Citas</h1>
              <p className="text-sm text-muted-foreground">
                Panel de administración
              </p>
            </div>
            <Button
              variant="outline"
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
          <TabsList className="bg-card border">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="citas">Todas las Citas</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

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
              </div>
            ) : claims ? (
              <>
                <StatsCards claims={claims} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <ClaimsChart claims={claims} />
                  <ServicesPieChart claims={claims} />
                </div>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="citas">
            {isLoading ? (
              <Skeleton className="h-[500px] rounded-lg" />
            ) : claims ? (
              <ClaimsTable claims={claims} />
            ) : null}
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
