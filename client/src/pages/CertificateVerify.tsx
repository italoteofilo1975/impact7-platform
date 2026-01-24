import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Shield, CheckCircle, XCircle, Search, QrCode, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';

export default function CertificateVerify() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [certificateId, setCertificateId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Extract certificate ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const urlCertId = urlParams.get('id');

  const verifyCertificate = trpc.certificates.verify.useMutation({
    onSuccess: () => setIsVerifying(false),
    onError: () => setIsVerifying(false),
  });

  const handleVerify = () => {
    const idToVerify = certificateId || urlCertId;
    if (!idToVerify) return;
    
    setIsVerifying(true);
    verifyCertificate.mutate({ certificateId: idToVerify });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const result = verifyCertificate.data;

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('certificates.verify')}</h1>
            <p className="text-muted-foreground">
              Verifique a autenticidade de um certificado de impacto IMPACT7
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Verificar Certificado
              </CardTitle>
              <CardDescription>
                Digite o ID do certificado ou escaneie o QR Code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Ex: CERT-ABC123-XYZ789"
                  value={certificateId || urlCertId || ''}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleVerify} 
                  disabled={isVerifying || (!certificateId && !urlCertId)}
                >
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {result && (
            <Card className={`border-2 ${result.valid ? 'border-green-500' : 'border-red-500'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {result.valid ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-green-500">{t('certificates.valid')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-500" />
                        <span className="text-red-500">{t('certificates.invalid')}</span>
                      </>
                    )}
                  </CardTitle>
                  {result.chainValid && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Cadeia Verificada
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              {result.certificate && (
                <CardContent className="space-y-6">
                  {/* Certificate Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Organização</h3>
                      <p className="text-lg font-semibold">{result.certificate.organizationName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Projeto</h3>
                      <p className="text-lg font-semibold">{result.certificate.projectName}</p>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        R$ {(result.certificate.totalInvestment / 1000).toFixed(0)}K
                      </p>
                      <p className="text-sm text-muted-foreground">Investimento</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {result.certificate.beneficiaries.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Beneficiários</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {result.certificate.sRoi}%
                      </p>
                      <p className="text-sm text-muted-foreground">S-ROI</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {result.certificate.impactScore}
                      </p>
                      <p className="text-sm text-muted-foreground">Score</p>
                    </div>
                  </div>

                  {/* Blockchain Info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t('certificates.blockchain')}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ID do Certificado:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-background px-2 py-1 rounded">
                            {result.certificate.certificateId}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(result.certificate!.certificateId)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('certificates.hash')}:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-background px-2 py-1 rounded text-xs">
                            {result.certificate.dataHash?.substring(0, 16)}...
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(result.certificate!.dataHash || '')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bloco:</span>
                        <span>#{result.certificate.blockNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Emitido em:</span>
                        <span>{new Date(result.certificate.issuedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      {result.certificate.verifiedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Verificado em:</span>
                          <span>{new Date(result.certificate.verifiedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Share Link */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Compartilhar verificação:</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      const url = `${window.location.origin}/certificados/verificar?id=${result.certificate!.certificateId}`;
                      copyToClipboard(url);
                    }}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Copiar Link
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Imutabilidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Cada certificado é protegido por hash SHA-256, garantindo que os dados não podem ser alterados.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Encadeamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Certificados são encadeados, permitindo verificar a integridade de toda a cadeia de impacto.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Verificação Fácil</h3>
                  <p className="text-sm text-muted-foreground">
                    Escaneie o QR Code ou digite o ID para verificar instantaneamente qualquer certificado.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
