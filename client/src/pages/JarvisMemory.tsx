import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Brain, 
  Search, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  Loader2,
  Star,
  Tag,
  Calendar,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/_core/hooks/useAuth';
import { MainNavbar } from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const memoryTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  preference: { label: 'Preferência', color: 'bg-blue-500', icon: '⚙️' },
  fact: { label: 'Fato', color: 'bg-green-500', icon: '📋' },
  context: { label: 'Contexto', color: 'bg-purple-500', icon: '🎯' },
  goal: { label: 'Objetivo', color: 'bg-orange-500', icon: '🎯' },
  project: { label: 'Projeto', color: 'bg-teal-500', icon: '📁' },
  interaction: { label: 'Interação', color: 'bg-pink-500', icon: '💬' },
};

export default function JarvisMemory() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<number | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  // Queries
  const { data: allMemories, isLoading, refetch } = trpc.jarvisMemory.getAll.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const { data: searchResults, isLoading: searchLoading } = trpc.jarvisMemory.search.useQuery(
    { query: searchQuery, limit: 50 },
    { enabled: isAuthenticated && searchQuery.length > 2 }
  );

  const { data: memoryContext } = trpc.jarvisMemory.buildContext.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const deleteMutation = trpc.jarvisMemory.delete.useMutation({
    onSuccess: () => {
      toast.success('Memória excluída com sucesso!');
      refetch();
      setDeleteDialogOpen(false);
      setMemoryToDelete(null);
    },
    onError: (error) => {
      toast.error('Erro ao excluir memória', { description: error.message });
    },
  });

  const clearAllMutation = trpc.jarvisMemory.clearAll.useMutation({
    onSuccess: () => {
      toast.success('Todas as memórias foram excluídas!');
      refetch();
      setClearAllDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao limpar memórias', { description: error.message });
    },
  });

  const handleDelete = (memoryId: number) => {
    setMemoryToDelete(memoryId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memoryToDelete) {
      deleteMutation.mutate({ memoryId: memoryToDelete });
    }
  };

  // Filter memories by type
  const filteredMemories = selectedType === 'all' 
    ? allMemories 
    : allMemories?.filter((m: any) => m.type === selectedType);

  // Use search results if searching
  const displayMemories = searchQuery.length > 2 
    ? (searchResults as any)?.results || searchResults 
    : filteredMemories;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <MainNavbar />
        <div className="min-h-screen bg-background pt-24 pb-16">
          <div className="container max-w-4xl">
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
                <p className="text-muted-foreground mb-4">
                  Faça login para acessar suas memórias do Jarvis.
                </p>
                <Link href="/">
                  <Button>Voltar ao Início</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Memórias do Jarvis | IMPACT7"
        description="Visualize e gerencie as memórias do assistente Jarvis"
      />
      <MainNavbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/jarvis">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Brain className="w-8 h-8 text-primary" />
                  Memórias do Jarvis
                </h1>
                <p className="text-muted-foreground">
                  Histórico de interações e conhecimento armazenado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Dialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Confirmar Exclusão
                    </DialogTitle>
                    <DialogDescription>
                      Esta ação irá excluir permanentemente todas as suas memórias do Jarvis.
                      Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setClearAllDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => clearAllMutation.mutate()}
                      disabled={clearAllMutation.isPending}
                    >
                      {clearAllMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</>
                      ) : (
                        'Excluir Todas'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{allMemories?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total de Memórias</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">
                    {allMemories?.filter((m: any) => m.type === 'preference').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Preferências</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {allMemories?.filter((m: any) => m.type === 'fact').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Fatos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-500">
                    {allMemories?.filter((m: any) => m.type === 'interaction').length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Interações</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar nas memórias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="preference">Preferências</SelectItem>
                      <SelectItem value="fact">Fatos</SelectItem>
                      <SelectItem value="context">Contexto</SelectItem>
                      <SelectItem value="goal">Objetivos</SelectItem>
                      <SelectItem value="project">Projetos</SelectItem>
                      <SelectItem value="interaction">Interações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory List */}
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="context">Contexto LLM</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {isLoading || searchLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : displayMemories && displayMemories.length > 0 ? (
                <div className="space-y-4">
                  {displayMemories.map((memory: any) => {
                    const typeInfo = memoryTypeLabels[memory.type] || { label: memory.type, color: 'bg-gray-500', icon: '📝' };
                    return (
                      <Card key={memory.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{typeInfo.icon}</span>
                                <Badge className={`${typeInfo.color} text-white`}>
                                  {typeInfo.label}
                                </Badge>
                                {memory.importance && memory.importance >= 7 && (
                                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    Alta Importância
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-lg mb-1">{memory.key}</h3>
                              <p className="text-muted-foreground">{memory.value}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(memory.createdAt).toLocaleString('pt-BR')}
                                </span>
                                {memory.importance && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Importância: {memory.importance}/10
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(memory.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma memória encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? 'Tente uma busca diferente'
                        : 'Comece a conversar com o Jarvis para criar memórias'}
                    </p>
                    <Link href="/jarvis">
                      <Button className="mt-4">
                        <Brain className="w-4 h-4 mr-2" />
                        Ir para o Jarvis
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="context">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Contexto para LLM
                  </CardTitle>
                  <CardDescription>
                    Este é o contexto que o Jarvis usa para personalizar suas respostas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {memoryContext ? (
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {memoryContext}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Nenhum contexto disponível ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta memória? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
