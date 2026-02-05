import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportPDFButtonProps {
  targetId: string;
  fileName: string;
  label?: string;
}

export const ExportPDFButton = ({
  targetId,
  fileName,
  label = "Exportar PDF",
}: ExportPDFButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 dimensions in pixels at 72 DPI
      const pdfWidth = 595.28;
      const pdfHeight = 841.89;
      
      // Calculate the scaled dimensions to fit width
      const ratio = pdfWidth / imgWidth;
      const scaledWidth = pdfWidth;
      const scaledHeight = imgHeight * ratio;

      // Create PDF with A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Calculate how many pages we need
      const pageHeight = pdfHeight - 40; // Leave some margin
      const totalPages = Math.ceil(scaledHeight / pageHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the y position for this page slice
        const sourceY = (page * pageHeight) / ratio;
        const sourceHeight = Math.min(pageHeight / ratio, imgHeight - sourceY);
        
        // Create a canvas for this page section
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          // Draw the section of the original canvas
          ctx.drawImage(
            canvas,
            0, sourceY, imgWidth, sourceHeight,
            0, 0, imgWidth, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL("image/png");
          const destHeight = sourceHeight * ratio;
          
          pdf.addImage(pageImgData, "PNG", 0, 20, scaledWidth, destHeight);
        }
      }

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
};
