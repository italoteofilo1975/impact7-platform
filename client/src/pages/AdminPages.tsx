import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import DashboardLayout from '@/components/DashboardLayout';
import AdminBreadcrumb from '@/components/AdminBreadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, Eye, Globe, Lock } from 'lucide-react';

interface PageForm {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  isPublished: boolean;
}

const defaultForm: PageForm = {
  slug: '',
  title: '',
  content: '',
  metaDescription: '',
  isPublished: true,
};

export default function AdminPages() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PageForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.cms.adminList.useQuery();

  const createPage = trpc.cms.create.useMutation({
    onSuccess: () => {
      toast.success('Página criada com sucesso!');
      setShowForm(false);
      setForm(defaultForm);
      utils.cms.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePage = trpc.cms.update.useMutation({
    onSuccess: () => {
      toast.success('Página atualizada!');
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
      utils.cms.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deletePage = trpc.cms.delete.useMutation({
    onSuccess: () => {
      toast.success('Página excluída!');
      setDeleteId(null);
      utils.cms.adminList.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <p className="mb-4">Você precisa estar autenticado.</p>
          <a href={getLoginUrl()} className="text-primary underline">Entrar</a>
        </div>
      </DashboardLayout>
    );
  }

  const handleEdit = (page: any) => {
    setEditingId(page.id);
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content ?? '',
      metaDescription: page.metaDescription ?? '',
      isPublished: page.isPublished === 1,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error('Título obrigatório');
    if (!editingId && !form.slug.trim()) return toast.error('Slug obrigatório');

    if (editingId) {
      updatePage.mutate({
        id: editingId,
        title: form.title,
        content: form.content,
        metaDescription: form.metaDescription,
        isPublished: form.isPublished,
      });
    } else {
      createPage.mutate({
        slug: form.slug,
        title: form.title,
        content: form.content,
        metaDescription: form.metaDescription,
        isPublished: form.isPublished,
      });
    }
  };

  const slugSuggestion = form.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <AdminBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Páginas CMS' }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Páginas Institucionais</h1>
            <p className="text-muted-foreground">Gerencie o conteúdo das páginas do site</p>
          </div>
          <Button onClick={() => { setEditingId(null); setForm(defaultForm); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" />Nova Página
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : pages && pages.length > 0 ? (
          <div className="grid gap-4">
            {pages.map((page: any) => (
              <Card key={page.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{page.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{page.slug}</code>
                          <Badge variant={page.isPublished ? 'default' : 'secondary'} className="text-xs gap-1">
                            {page.isPublished ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            {page.isPublished ? 'Publicada' : 'Rascunho'}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => setPreviewContent(page.content ?? '')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(page.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {page.metaDescription && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{page.metaDescription}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma página criada</h3>
              <p className="text-muted-foreground mb-4">Crie páginas institucionais como Sobre, Termos de Uso, etc.</p>
              <Button onClick={() => { setEditingId(null); setForm(defaultForm); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />Criar Primeira Página
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingId(null); setForm(defaultForm); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Página' : 'Nova Página'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Título *</Label>
                <Input
                  placeholder="ex: Sobre Nós"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              {!editingId && (
                <div className="space-y-1">
                  <Label>Slug (URL) *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="ex: sobre-nos"
                      value={form.slug}
                      onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    />
                    {slugSuggestion && form.slug !== slugSuggestion && (
                      <Button variant="outline" size="sm" onClick={() => setForm(p => ({ ...p, slug: slugSuggestion }))}>
                        Usar sugestão
                      </Button>
                    )}
                  </div>
                  {form.slug && <p className="text-xs text-muted-foreground">URL: /paginas/{form.slug}</p>}
                </div>
              )}
              <div className="space-y-1">
                <Label>Meta Descrição (SEO)</Label>
                <Input
                  placeholder="Descrição para mecanismos de busca (máx. 500 chars)"
                  value={form.metaDescription}
                  onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                  maxLength={500}
                />
              </div>
              <div className="space-y-1">
                <Label>Conteúdo (Markdown)</Label>
                <Textarea
                  placeholder="# Título&#10;&#10;Conteúdo em Markdown..."
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  rows={12}
                  className="font-mono text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">Suporta formatação Markdown: **negrito**, *itálico*, # títulos, - listas</p>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Publicar página</p>
                  <p className="text-xs text-muted-foreground">Página visível publicamente no site</p>
                </div>
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={v => setForm(p => ({ ...p, isPublished: v }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createPage.isPending || updatePage.isPending}>
                {editingId ? 'Salvar Alterações' : 'Criar Página'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewContent !== null} onOpenChange={() => setPreviewContent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Pré-visualização do Conteúdo</DialogTitle></DialogHeader>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {previewContent}
            </pre>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewContent(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
            <p className="text-muted-foreground">Esta ação não pode ser desfeita. A página será permanentemente excluída.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => deleteId && deletePage.mutate({ id: deleteId })} disabled={deletePage.isPending}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
