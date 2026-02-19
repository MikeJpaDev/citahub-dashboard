import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Claim } from "@/types/claim";
import { useClaimLocalState, getClaimStatus, type ClaimStatus } from "@/hooks/useClaimLocalState";

interface ClaimsTableProps {
  claims: Claim[];
}

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  "En Espera": {
    label: "En Espera",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  "En Proceso": {
    label: "En Proceso",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Completado: {
    label: "Completado",
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

export const ClaimsTable = ({ claims }: ClaimsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const { getData, setNumeroCita, setCompletado } = useClaimLocalState();

  const totalPages = Math.ceil(claims.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClaims = claims.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleResendEmail = async (claim: Claim) => {
    setResendingId(claim.id);
    try {
      const BASE_URL_GUAJIRITOS = import.meta.env.VITE_BASE_URL_GUAJIRITOS;
      const response = await fetch(`${BASE_URL_GUAJIRITOS}/claim/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(claim.id) }),
      });
      if (!response.ok) throw new Error("Error en la petición");
      toast.success(`Correo reenviado a ${claim.email}`);
    } catch {
      toast.error("Error al reenviar el correo");
    } finally {
      setResendingId(null);
    }
  };

  const handleComplete = async (claim: Claim) => {
    const data = getData(claim.id);
    const status = getClaimStatus(data);
    if (status === "Completado") return;

    setCompletingId(claim.id);
    try {
      const BASE_URL_GUAJIRITOS = import.meta.env.VITE_BASE_URL_GUAJIRITOS;
      const response = await fetch(`${BASE_URL_GUAJIRITOS}/claim/completed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(claim.id) }),
      });
      if (!response.ok) throw new Error("Error en la petición");
      setCompletado(claim.id);
      toast.success(`Servicio completado notificado a ${claim.email}`);
    } catch {
      toast.error("Error al enviar la notificación de completado");
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Todas las Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Nº Cita</TableHead>
                  <TableHead className="font-semibold">Titular</TableHead>
                  <TableHead className="font-semibold">Servicio</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold">Hora</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Teléfono</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No hay citas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClaims.map((claim) => {
                    const localData = getData(claim.id);
                    const status = getClaimStatus(localData);
                    const { label, className } = statusConfig[status];
                    const isCompleted = status === "Completado";

                    return (
                      <TableRow key={claim.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{claim.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-medium ${className}`}>
                            {label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-7 w-24 text-xs"
                            placeholder="—"
                            value={localData.numeroCita}
                            disabled={isCompleted}
                            onChange={(e) => setNumeroCita(claim.id, e.target.value)}
                          />
                        </TableCell>
                        <TableCell>{claim.nombre_titular}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {claim.servicio}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(claim.fecha_cita).toLocaleDateString("es-ES", { timeZone: "UTC" })}
                        </TableCell>
                        <TableCell>{claim.hora_franja}</TableCell>
                        <TableCell className="text-muted-foreground">{claim.email}</TableCell>
                        <TableCell className="text-muted-foreground">{claim.telefono}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedClaim(claim)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendEmail(claim)}
                              disabled={resendingId === claim.id}
                              title="Reenviar correo"
                            >
                              {resendingId === claim.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComplete(claim)}
                              disabled={isCompleted || completingId === claim.id}
                              title={isCompleted ? "Ya completado" : "Marcar como completado"}
                              className={isCompleted ? "text-green-600" : "hover:text-green-600"}
                            >
                              {completingId === claim.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, claims.length)} de {claims.length} citas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && setSelectedClaim(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa de la cita #{selectedClaim?.id}</DialogDescription>
          </DialogHeader>
          {selectedClaim && (() => {
            const localData = getData(selectedClaim.id);
            const status = getClaimStatus(localData);
            return (
              <div className="grid gap-3 text-sm">
                <DetailRow label="ID" value={String(selectedClaim.id)} />
                <DetailRow label="Estado" value={status} />
                <DetailRow label="Nº Cita" value={localData.numeroCita || "—"} />
                <DetailRow label="Titular" value={selectedClaim.nombre_titular} />
                <DetailRow label="Servicio" value={selectedClaim.servicio} />
                <DetailRow label="Fecha de Cita" value={new Date(selectedClaim.fecha_cita).toLocaleDateString("es-ES", { timeZone: "UTC" })} />
                <DetailRow label="Hora / Franja" value={selectedClaim.hora_franja} />
                <DetailRow label="Email" value={selectedClaim.email} />
                <DetailRow label="Teléfono" value={selectedClaim.telefono} />
                <DetailRow label="Calendar Event ID" value={selectedClaim.calendar_event_id || "—"} />
                <DetailRow label="Chat ID" value={selectedClaim.chat_id || "—"} />
                <DetailRow label="Creado" value={selectedClaim.createdAt ? new Date(selectedClaim.createdAt).toLocaleString("es-ES") : "—"} />
                <DetailRow label="Actualizado" value={selectedClaim.updatedAt ? new Date(selectedClaim.updatedAt).toLocaleString("es-ES") : "—"} />
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border/50 pb-2">
    <span className="font-medium text-muted-foreground">{label}</span>
    <span className="text-right max-w-[60%] break-all">{value}</span>
  </div>
);
