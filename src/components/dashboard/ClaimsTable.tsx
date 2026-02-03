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
import type { Claim } from "@/types/claim";

interface ClaimsTableProps {
  claims: Claim[];
}

export const ClaimsTable = ({ claims }: ClaimsTableProps) => {
  return (
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
                <TableHead className="font-semibold">Titular</TableHead>
                <TableHead className="font-semibold">Servicio</TableHead>
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Hora</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Teléfono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{claim.id}</TableCell>
                  <TableCell>{claim.nombre_titular}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {claim.servicio}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(claim.fecha_cita).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell>{claim.hora_franja}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {claim.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {claim.telefono}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
