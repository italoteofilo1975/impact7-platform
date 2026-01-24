import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Code,
  Variable,
} from 'lucide-react';

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Informação', color: 'bg-blue-500' },
  { value: 'success', label: 'Sucesso', color: 'bg-green-500' },
  { value: 'warning', label: 'Aviso', color: 'bg-yellow-500' },
  { value: 'error', label: 'Erro', color: 'bg-red-500' },
  { value: 'case_pending', label: 'Case Pendente', color: 'bg-orange-500' },
  { value: 'case_approved', label: 'Case Aprovado', color: 'bg-green-500' },
  { value: 'case_rejected', label: 'Case Rejeitado', color: 'bg-red-500' },
  { value: 'certificate_issued', label: 'Certificado Emitido', color: 'bg-purple-500' },
  { value: 'token_earned', label: 'Token Ganho', color: 'bg-amber-500' },
  { value: 'system', label: 'Sistema', color: 'bg-gray-500' },
] as const;

type NotificationType = typeof NOTIFICATION_TYPES[number]['value'];

interface TemplateFormData {
  code: string;
  name: string;
  description: string;
  type: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  isActive: boolean;
}

const defaultFormData: TemplateFormData = {
  code: '',
  name: '',
  description: '',
  type: 'info',
  titleTemplate: '',
  messageTemplate: '',
  isActive: true,
};

export default function AdminTemplates() {
  const { user, isAuthenticated } = useAuth();
  const authLoading = !isAuthenticated && !user;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('list');

  const { data: templates, isLoading, refetch } = trpc.notificationTemplates.list.useQuery();
  const { data: variables } = trpc.notificationTemplates.getVariables.useQuery(
    { type: formData.type },
    { enabled: isDialogOpen }
  );

  const createMutation = trpc.notificationTemplates.create.useMutation({
    onSuccess: () => {
      toast.success('Template criado com sucesso!');
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao criar template', { description: error.message });
    },
  });

  const updateMutation = trpc.notificationTemplates.update.useMutation({
    onSuccess: () => {
      toast.success('Template atualizado com sucesso!');
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar template', { description: error.message });
    },
  });

  const deleteMutation = trpc.notificationTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success('Template excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao excluir template', { description: error.message });
    },
  });

  const seedMutation = trpc.notificationTemplates.seedDefaults.useMutation({
    onSuccess: () => {
      toast.success('Templates padrão criados!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao criar templates padrão', { description: error.message });
    },
  });

  // Preview rendering
  const renderedPreview = useMemo(() => {
    let title = formData.titleTemplate;
    let message = formData.messageTemplate;

    for (const [key, value] of Object.entries(previewVariables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      title = title.replace(regex, value || `[${key}]`);
      message = message.replace(regex, value || `[${key}]`);
    }

    return { title, message };
  }, [formData.titleTemplate, formData.messageTemplate, previewVariables]);

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setPreviewVariables({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: NonNullable<typeof templates>[number]) => {
    setFormData({
      code: template.code,
      name: template.name,
      description: template.description || '',
      type: template.type as NotificationType,
      titleTemplate: template.titleTemplate,
      messageTemplate: template.messageTemplate,
      isActive: template.isActive,
    });
    setEditingId(template.id);
    setPreviewVariables({});
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        titleTemplate: formData.titleTemplate,
        messageTemplate: formData.messageTemplate,
        isActive: formData.isActive,
      });
    } else {
      createMutation.mutate({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        titleTemplate: formData.titleTemplate,
        messageTemplate: formData.messageTemplate,
        isActive: formData.isActive,
      });
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
  };

  const insertVariable = (varName: string) => {
    setFormData(prev => ({
      ...prev,
      messageTemplate: prev.messageTemplate + `{{${varName}}}`,
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'admin') {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <AdminBreadcrumb items={[{ label: 'Templates de Notificação' }]} />
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary" />
              Templates de Notificação
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie templates personalizados para notificações automáticas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Criar Padrões
            </Button>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{templates?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-green-500">
                    {templates?.filter(t => t.isActive).length || 0}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sistema</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {templates?.filter(t => t.isSystem).length || 0}
                  </p>
                </div>
                <Code className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Personalizados</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {templates?.filter(t => !t.isSystem).length || 0}
                  </p>
                </div>
                <Variable className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Templates Cadastrados</CardTitle>
            <CardDescription>
              Clique em um template para editar ou visualizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : templates?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground mb-4">Nenhum template cadastrado</p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates?.map((template) => {
                  const typeInfo = NOTIFICATION_TYPES.find(t => t.value === template.type);
                  return (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${typeInfo?.color || 'bg-gray-500'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{template.name}</p>
                            {template.isSystem && (
                              <Badge variant="secondary" className="text-xs">Sistema</Badge>
                            )}
                            {!template.isActive && (
                              <Badge variant="outline" className="text-xs text-yellow-500">Inativo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{template.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{typeInfo?.label || template.type}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(template.code)}
                          title="Copiar código"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(template)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!template.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id)}
                            className="text-red-500 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>
                Configure o template de notificação com variáveis dinâmicas
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Editar</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código (único)</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="ex: case_approved_custom"
                      disabled={!!editingId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ex: Case Aprovado (Personalizado)"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NotificationType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTIFICATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${type.color}`} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Template ativo</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do template..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleTemplate">Template do Título</Label>
                  <Input
                    id="titleTemplate"
                    value={formData.titleTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleTemplate: e.target.value }))}
                    placeholder="ex: 🎉 Case {{caseName}} Aprovado!"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageTemplate">Template da Mensagem</Label>
                  <Textarea
                    id="messageTemplate"
                    value={formData.messageTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, messageTemplate: e.target.value }))}
                    placeholder="ex: Parabéns, {{userName}}! Seu case foi aprovado em {{approvalDate}}."
                    rows={4}
                  />
                </div>

                {/* Variables */}
                {variables && variables.length > 0 && (
                  <div className="space-y-2">
                    <Label>Variáveis Disponíveis</Label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
                      {variables.map((v) => (
                        <Button
                          key={v.name}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(v.name)}
                          title={`${v.description} (ex: ${v.example})`}
                        >
                          <Variable className="w-3 h-3 mr-1" />
                          {v.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {/* Preview Variables Input */}
                <div className="space-y-2">
                  <Label>Valores para Preview</Label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {variables?.map((v) => (
                      <div key={v.name} className="flex items-center gap-2">
                        <Label className="w-32 text-sm">{v.name}:</Label>
                        <Input
                          value={previewVariables[v.name] || ''}
                          onChange={(e) => setPreviewVariables(prev => ({
                            ...prev,
                            [v.name]: e.target.value,
                          }))}
                          placeholder={v.example}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Result */}
                <div className="space-y-2">
                  <Label>Resultado</Label>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        NOTIFICATION_TYPES.find(t => t.value === formData.type)?.color || 'bg-gray-500'
                      }`}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{renderedPreview.title || '[Título vazio]'}</p>
                        <p className="text-muted-foreground mt-1">{renderedPreview.message || '[Mensagem vazia]'}</p>
                        <p className="text-xs text-muted-foreground mt-2">Agora mesmo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingId ? 'Salvar Alterações' : 'Criar Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
