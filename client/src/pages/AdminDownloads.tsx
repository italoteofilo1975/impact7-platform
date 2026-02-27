import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import {
  Download,
  Loader2,
  Search,
  Mail,
  Calendar,
  FileText,
  BookOpen,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function AdminDownloads() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('whitepaper');

  const { data: whitepaperDownloads, isLoading: wpLoading, refetch: refetchWp } = trpc.downloads.listWhitepaper.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: ebookDownloads, isLoading: ebookLoading, refetch: refetchEbook } = trpc.downloads.listEbook.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { refetch: exportCsv, isFetching: isExporting } = trpc.downloads.exportCsv.useQuery(
    { type: activeTab === 'whitepaper' ? 'whitepaper' : activeTab === 'ebook' ? 'ebook' : 'all' },
    { enabled: false }
  );

  const handleExport = async () => {
    try {
      const result = await exportCsv();
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `downloads_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${result.data.count} downloads exportados com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar downloads');
    }
  };

  const formatDate = (date: Date | string | number) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredWhitepaper = whitepaperDownloads?.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEbook = ebookDownloads?.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Esta página é restrita a administradores.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const totalDownloads = (whitepaperDownloads?.length || 0) + (ebookDownloads?.length || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Downloads' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Download className="w-7 h-7 text-primary" />
              Downloads
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe downloads de whitepaper e e-book
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { refetchWp(); refetchEbook(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Downloads</p>
                  <p className="text-2xl font-bold">{totalDownloads}</p>
                </div>
                <Download className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Whitepaper</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {whitepaperDownloads?.length || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">E-book</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {ebookDownloads?.length || 0}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-green-500">
                    {totalDownloads > 0 ? '12.5%' : '0%'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Downloads Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="whitepaper" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Whitepaper ({whitepaperDownloads?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="ebook" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              E-book ({ebookDownloads?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whitepaper">
            <Card>
              <CardHeader>
                <CardTitle>Downloads do Whitepaper</CardTitle>
                <CardDescription>
                  {filteredWhitepaper?.length || 0} downloads encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {wpLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredWhitepaper?.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">Nenhum download encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWhitepaper?.map((download) => (
                      <div
                        key={download.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{download.name || 'Sem nome'}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {download.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">Whitepaper</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(download.downloadedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ebook">
            <Card>
              <CardHeader>
                <CardTitle>Downloads do E-book</CardTitle>
                <CardDescription>
                  {filteredEbook?.length || 0} downloads encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ebookLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredEbook?.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">Nenhum download encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEbook?.map((download) => (
                      <div
                        key={download.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium">{download.name || 'Sem nome'}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {download.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="bg-purple-500/10">E-book</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(download.downloadedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
