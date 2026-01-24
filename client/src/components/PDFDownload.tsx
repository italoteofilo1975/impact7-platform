import { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFDownloadProps {
  htmlContent: string;
  filename: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function PDFDownload({
  htmlContent,
  filename,
  buttonText = 'Download PDF',
  variant = 'default',
  size = 'default',
  className = '',
}: PDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);
      
      const options = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };
      
      await html2pdf().set(options).from(tempContainer).save();
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={isGenerating || !htmlContent}
        className={className}
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>
        ) : (
          <><Download className="w-4 h-4 mr-2" />{buttonText}</>
        )}
      </Button>
      <div ref={containerRef} style={{ display: 'none' }} />
    </>
  );
}

export function usePDFDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (htmlContent: string, filename: string) => {
    setIsGenerating(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);
      
      const options = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };
      
      await html2pdf().set(options).from(tempContainer).save();
      document.body.removeChild(tempContainer);
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating };
}
