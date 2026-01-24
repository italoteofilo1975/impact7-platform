/**
 * Página de Certificados do Usuário
 * Exibe certificados emitidos e permite download em PDF
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, Award, Download, ExternalLink, Shield, 
  CheckCircle, Clock, XCircle, Loader2, QrCode,
  FileText, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const STATUS_CONFIG = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500' },
  verified: { label: 'Verificado', icon: CheckCircle, color: 'bg-green-500' },
  revoked: { label: 'Revogado', icon: XCircle, color: 'bg-gray-500' },
};

export default function MeusCertificados() {
  const { user, isAuthenticated } = useAuth();
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const { data: certificates, isLoading } = trpc.certificates.getUserCertificates.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const handleDownloadPDF = async (cert: any) => {
    setDownloadingId(cert.certificateId);
    try {
      // Gerar HTML do certificado
      const html = generateCertificateHTML(cert);
      
      // Usar html2pdf para gerar o PDF
      const html2pdf = (await import('html2pdf.js')).default;
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = html;
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);
      
      const options = {
        margin: 0,
        filename: `certificado-${cert.certificateId}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
      };
      
      await html2pdf().set(options).from(tempContainer).save();
      document.body.removeChild(tempContainer);
      
      toast.success('Download concluído', {
        description: 'Seu certificado foi baixado com sucesso.',
      });
    } catch (error) {
      toast.error('Erro no download', {
        description: 'Não foi possível baixar o certificado. Tente novamente.',
      });
    } finally {
      setDownloadingId(null);
    }
  };
  
  const handleShare = async (cert: any) => {
    const url = `${window.location.origin}/verificar-certificado/${cert.certificateNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado IMPACT7 - ${cert.title}`,
          text: `Confira meu certificado de ${cert.title} emitido pela plataforma IMPACT7`,
          url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado', {
        description: 'O link do certificado foi copiado para a área de transferência.',
      });
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEO title="Meus Certificados" description="Acesse seus certificados IMPACT7" />
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Acesse seus Certificados</CardTitle>
            <CardDescription>
              Faça login para ver e baixar seus certificados IMPACT7.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a href={getLoginUrl()}>
              <Button size="lg">
                Fazer Login
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const approvedCerts = certificates?.filter(c => c.verificationStatus === 'verified') || [];
  const pendingCerts = certificates?.filter(c => c.verificationStatus === 'pending') || [];
  const otherCerts = certificates?.filter(c => c.verificationStatus === 'revoked') || [];
  
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Meus Certificados" 
        description="Visualize e baixe seus certificados IMPACT7"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Meus Certificados</h1>
            <p className="text-muted-foreground">
              Visualize, baixe e compartilhe seus certificados
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCerts.length}</p>
                <p className="text-sm text-muted-foreground">Certificados Ativos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCerts.length}</p>
                <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{certificates?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Certificados</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Certificates List */}
        <Tabs defaultValue="approved" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approved">
              Ativos ({approvedCerts.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes ({pendingCerts.length})
            </TabsTrigger>
            <TabsTrigger value="other">
              Outros ({otherCerts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="approved">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : approvedCerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum certificado ativo</h3>
                  <p className="text-muted-foreground mb-4">
                    Submeta cases de impacto para obter certificados.
                  </p>
                  <Link href="/cases/submit">
                    <Button>Submeter Case</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {approvedCerts.map((cert) => (
                  <CertificateCard 
                    key={cert.id} 
                    certificate={cert}
                    onDownload={() => handleDownloadPDF(cert)}
                    onShare={() => handleShare(cert)}
                    isDownloading={downloadingId === cert.certificateId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {pendingCerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">Nenhum certificado pendente</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingCerts.map((cert) => (
                  <CertificateCard 
                    key={cert.id} 
                    certificate={cert}
                    isPending
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="other">
            {otherCerts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold">Nenhum outro certificado</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {otherCerts.map((cert) => (
                  <CertificateCard 
                    key={cert.id} 
                    certificate={cert}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sobre os Certificados IMPACT7
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Os certificados IMPACT7 são documentos digitais que atestam a participação 
              e os resultados de projetos de impacto social mensurados através da nossa metodologia.
            </p>
            <ul>
              <li><strong>Verificáveis:</strong> Cada certificado possui um código único que pode ser verificado online</li>
              <li><strong>Seguros:</strong> Registrados em blockchain para garantir autenticidade</li>
              <li><strong>Compartilháveis:</strong> Podem ser baixados em PDF ou compartilhados via link</li>
            </ul>
            <p>
              <Link href="/certificacoes" className="text-primary hover:underline">
                Saiba mais sobre nossos níveis de certificação →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface CertificateCardProps {
  certificate: any;
  onDownload?: () => void;
  onShare?: () => void;
  isDownloading?: boolean;
  isPending?: boolean;
}

function CertificateCard({ certificate, onDownload, onShare, isDownloading, isPending }: CertificateCardProps) {
  const status = STATUS_CONFIG[certificate.verificationStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Certificate Preview */}
        <div className="md:w-48 bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex items-center justify-center">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto text-primary mb-2" />
            <Badge className={status.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
        
        {/* Certificate Info */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{certificate.title}</h3>
              <p className="text-sm text-muted-foreground">
                Emitido em {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Número</p>
              <p className="font-mono text-sm">{certificate.certificateNumber}</p>
            </div>
          </div>
          
          {certificate.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {certificate.description}
            </p>
          )}
          
          {/* Actions */}
          {!isPending && certificate.verificationStatus === 'verified' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={onDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gerando...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" />Download PDF</>
                )}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={onShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              
              <Link href={`/verificar-certificado/${certificate.certificateNumber}`}>
                <Button size="sm" variant="ghost">
                  <QrCode className="w-4 h-4 mr-2" />
                  Verificar
                </Button>
              </Link>
            </div>
          )}
          
          {isPending && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Este certificado está aguardando aprovação da equipe de revisão.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function generateCertificateHTML(cert: any): string {
  return `
    <div style="width: 297mm; height: 210mm; padding: 20mm; box-sizing: border-box; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; font-family: 'Georgia', serif;">
      <div style="border: 2px solid #e94560; padding: 15mm; height: 100%; box-sizing: border-box; position: relative;">
        <div style="text-align: center; margin-bottom: 10mm;">
          <h1 style="font-size: 24pt; color: #e94560; margin: 0;">IMPACT7</h1>
          <p style="font-size: 10pt; letter-spacing: 3px; margin: 5mm 0 0 0;">CERTIFICADO DE IMPACTO SOCIAL</p>
        </div>
        
        <div style="text-align: center; margin: 15mm 0;">
          <p style="font-size: 12pt; margin-bottom: 5mm;">Certificamos que</p>
          <h2 style="font-size: 20pt; color: #e94560; margin: 0;">${cert.recipientName || 'Organização'}</h2>
        </div>
        
        <div style="text-align: center; margin: 10mm 0;">
          <p style="font-size: 11pt; line-height: 1.6;">
            ${cert.description || 'Demonstrou excelência na mensuração e gestão de impacto social através da metodologia IMPACT7.'}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 15mm;">
          <h3 style="font-size: 14pt; margin: 0;">${cert.title}</h3>
        </div>
        
        <div style="position: absolute; bottom: 15mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="font-size: 8pt; margin: 0;">Emitido em: ${new Date(cert.issuedAt).toLocaleDateString('pt-BR')}</p>
            <p style="font-size: 8pt; margin: 2mm 0 0 0;">Certificado: ${cert.certificateNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 8pt; margin: 0;">Verifique em:</p>
            <p style="font-size: 8pt; margin: 2mm 0 0 0;">impact7.com/verificar/${cert.certificateNumber}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
