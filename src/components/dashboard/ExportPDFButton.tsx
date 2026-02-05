import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileDown, Loader2, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import type { Claim } from "@/types/claim";

interface ExportPDFButtonProps {
  claims: Claim[];
  fileName: string;
  label?: string;
}

export const ExportPDFButton = ({
  claims,
  fileName,
  label = "Exportar PDF",
}: ExportPDFButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Filter claims for the selected date
      const filteredClaims = claims.filter((claim) =>
        isSameDay(parseISO(claim.fecha_cita), selectedDate)
      );

      if (filteredClaims.length === 0) {
        alert("No hay citas para la fecha seleccionada");
        setIsExporting(false);
        return;
      }

      // Create a temporary container for the PDF content
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "20px";
      container.style.fontFamily = "Inter, system-ui, sans-serif";

      // Build HTML content
      container.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #1e3a5f;">
            Reporte de Citas
          </h1>
          <p style="font-size: 14px; color: #64748b; margin: 0;">
            Fecha: ${format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">
            Total de citas: ${filteredClaims.length}
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600;">ID</th>
              <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600;">Titular</th>
              <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600;">Servicio</th>
              <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600;">Hora</th>
              <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600;">Email</th>
              <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600;">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            ${filteredClaims
              .map(
                (claim, index) => `
              <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${claim.id}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${claim.nombre_titular}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${claim.servicio}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${claim.hora_franja}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${claim.email}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${claim.telefono}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdfWidth = 595.28;
      const pdfHeight = 841.89;
      const ratio = pdfWidth / imgWidth;
      const scaledWidth = pdfWidth;
      const scaledHeight = imgHeight * ratio;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageHeight = pdfHeight - 40;
      const totalPages = Math.ceil(scaledHeight / pageHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const sourceY = (page * pageHeight) / ratio;
        const sourceHeight = Math.min(pageHeight / ratio, imgHeight - sourceY);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            imgWidth,
            sourceHeight,
            0,
            0,
            imgWidth,
            sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL("image/png");
          const destHeight = sourceHeight * ratio;

          pdf.addImage(pageImgData, "PNG", 0, 20, scaledWidth, destHeight);
        }
      }

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      pdf.save(`${fileName}-${dateStr}.pdf`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Exportar Citas a PDF</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Selecciona la fecha para exportar las citas de ese día:
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={es}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-2">
              {claims.filter((c) =>
                isSameDay(parseISO(c.fecha_cita), selectedDate)
              ).length}{" "}
              cita(s) encontrada(s) para esta fecha
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
