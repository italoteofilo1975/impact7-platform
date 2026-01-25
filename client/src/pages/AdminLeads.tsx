import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import NavigationButtons from '@/components/NavigationButtons';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import {
  Users,
  Loader2,
  Search,
  Mail,
  Phone,
  Calendar,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  Filter,
} from 'lucide-react';

export default function AdminLeads() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: leads, isLoading, refetch } = trpc.leads.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { refetch: exportCsv, isFetching: isExporting } = trpc.leads.exportCsv.useQuery(
    { source: statusFilter === 'all' ? undefined : statusFilter },
    { enabled: 0 }
  );

  const handleExport = async () => {
    try {
      const result = await exportCsv();
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${result.data.count} leads exportados com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar leads');
    }
  };

  // Placeholder para futura implementação de delete
  const handleDelete = (id: number) => {
    toast.info('Funcionalidade em desenvolvimento', {
      description: 'A exclusão de leads será implementada em breve.',
    });
  };

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && lead.source === statusFilter;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'contact_form':
        return <Badge className="bg-blue-500">Formulário</Badge>;
      case 'whitepaper_download':
        return <Badge className="bg-green-500">Whitepaper</Badge>;
      case 'ebook':
        return <Badge className="bg-purple-500">E-book</Badge>;
      case 'calculator':
        return <Badge className="bg-orange-500">Calculadora</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

  return (
    <DashboardLayout>
      <div className="mb-4">
        <NavigationButtons showBack={true} backUrl="/admin" />
      </div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Leads & Contatos' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              Leads & Contatos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie leads capturados através do site
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
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
                  <p className="text-sm text-muted-foreground">Total de Leads</p>
                  <p className="text-2xl font-bold">{leads?.length || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {leads?.filter(l => l.source === 'contact_form').length || 0}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Qualificados</p>
                  <p className="text-2xl font-bold text-green-500">
                    {leads?.filter(l => l.source === 'whitepaper_download').length || 0}
                  </p>
                </div>
                <Phone className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Convertidos</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {leads?.filter(l => l.source === 'calculator').length || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="contact_form">Formulário</SelectItem>
                  <SelectItem value="whitepaper_download">Whitepaper</SelectItem>
                  <SelectItem value="ebook">E-book</SelectItem>
                  <SelectItem value="calculator">Calculadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Leads</CardTitle>
            <CardDescription>
              {filteredLeads?.length || 0} leads encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredLeads?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">Nenhum lead encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads?.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {lead.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lead.name || 'Sem nome'}</p>
                          {getStatusBadge(lead.source || 'contact_form')}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                          {lead.organization && (
                            <span>{lead.organization}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(lead.id)}
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
