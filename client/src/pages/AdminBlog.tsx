import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  status?: string | null;
  category?: string | null;
  authorName?: string | null;
  publishedAt?: number | null;
  isFeatured?: number | null;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  readTime?: string | null;
}

type BlogStatus = "draft" | "published";
const EMPTY_FORM: {
  title: string; slug: string; excerpt: string; content: string; category: string;
  coverImage: string; readTime: string; status: BlogStatus; isFeatured: boolean;
} = {
  title: "", slug: "", excerpt: "", content: "", category: "",
  coverImage: "", readTime: "", status: "draft", isFeatured: false,
};

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminBlog() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.blog.list.useQuery({ page, limit: 20 });
  const posts: BlogPost[] = (data?.posts ?? []) as BlogPost[];

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); setOpen(false); toast.success('Post criado!'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); setOpen(false); toast.success('Post atualizado!'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => { utils.blog.list.invalidate(); toast.success('Post excluído!'); },
    onError: (e) => toast.error(e.message),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    setForm({
      title: post.title ?? "",
      slug: post.slug ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      category: post.category ?? "",
      coverImage: post.coverImage ?? "",
      readTime: post.readTime ?? "",
      status: ((post.status === "published" ? "published" : "draft") as BlogStatus),
      isFeatured: !!post.isFeatured,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) { toast.error('Título é obrigatório'); return; }
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Blog</h1>
            <p className="text-muted-foreground">Crie e edite artigos do blog</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Novo Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Posts ({data?.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Nenhum post criado ainda.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Destaque</TableHead>
                    <TableHead>Publicado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs">
                        <p className="truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground truncate">/blog/{post.slug}</p>
                      </TableCell>
                      <TableCell>{post.category ? <Badge variant="secondary">{post.category}</Badge> : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "outline"}>
                          {post.status === "published" ? "Publicado" : post.status === "draft" ? "Rascunho" : post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.isFeatured ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                            onClick={() => { if (confirm("Excluir este post?")) deleteMutation.mutate({ id: post.id }); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {(data?.pages ?? 1) > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <span className="text-sm text-muted-foreground self-center">Pág. {page}/{data?.pages}</span>
                <Button variant="outline" size="sm" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal criar/editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Post" : "Novo Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({
                  ...f, title: e.target.value,
                  slug: f.slug || slugify(e.target.value),
                }))} placeholder="Título do artigo" className="mt-1" />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="titulo-do-artigo" className="mt-1" />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Ex: Metodologia" className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as BlogStatus }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tempo de leitura</Label>
                <Input value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                  placeholder="Ex: 8 min" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>URL da imagem de capa</Label>
                <Input value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                  placeholder="https://..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Resumo</Label>
                <Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Breve descrição do artigo..." rows={3} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>Conteúdo (Markdown)</Label>
                <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="# Título&#10;&#10;Conteúdo em Markdown..." rows={10} className="mt-1 font-mono text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} />
                <Label>Artigo em destaque</Label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={isPending}>
              {isPending ? "Salvando..." : editing ? "Salvar alterações" : "Criar post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
