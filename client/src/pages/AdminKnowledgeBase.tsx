import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  Tag as TagIcon,
} from "lucide-react";

type DocForm = {
  title: string;
  category: string;
  tags: string;
  content: string;
};

const emptyForm: DocForm = {
  title: "",
  category: "",
  tags: "",
  content: "",
};

function splitTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function AdminKnowledgeBase() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DocForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: docs = [], isLoading } = trpc.knowledgeBase.list.useQuery({ activeOnly: false });

  const {
    data: searchResults = [],
    isFetching: isSearching,
  } = trpc.knowledgeBase.search.useQuery(
    { query: searchQuery, topK: 10 },
    { enabled: searchQuery.trim().length >= 2 },
  );

  const ingestMutation = trpc.knowledgeBase.ingest.useMutation({
    onSuccess: () => {
      toast.success("Documento adicionado com sucesso!");
      utils.knowledgeBase.list.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error("Erro ao adicionar documento: " + e.message),
  });

  const removeMutation = trpc.knowledgeBase.remove.useMutation({
    onSuccess: () => {
      toast.success("Documento removido.");
      utils.knowledgeBase.list.invalidate();
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error("Erro ao remover documento: " + e.message),
  });

  const reindexMutation = trpc.knowledgeBase.reindex.useMutation({
    onSuccess: (res) => {
      toast.success(`Reindexação concluída: ${res.reindexed} documento(s) atualizado(s).`);
      utils.knowledgeBase.list.invalidate();
    },
    onError: (e) => toast.error("Erro ao reindexar embeddings: " + e.message),
  });

  const seedMutation = trpc.knowledgeBase.seed.useMutation({
    onSuccess: (res) => {
      toast.success(`Conteúdo canônico populado: ${res.inserted} inserido(s), ${res.skipped} já existente(s).`);
      utils.knowledgeBase.list.invalidate();
    },
    onError: (e) => toast.error("Erro ao popular conteúdo canônico: " + e.message),
  });

  function openCreate() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function handleSubmit() {
    ingestMutation.mutate({
      title: form.title,
      content: form.content,
      category: form.category,
      tags: form.tags.trim() || undefined,
    });
  }

  function runSearch() {
    setSearchQuery(searchInput);
  }

  const isSubmitting = ingestMutation.isPending;
  const canSubmit =
    form.title.trim().length >= 2 &&
    form.content.trim().length >= 1 &&
    form.category.trim().length >= 1;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <AdminBreadcrumb
          items={[{ label: "Admin", href: "/admin" }, { label: "Base de Conhecimento" }]}
        />

        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Base de Conhecimento (Jarvis RAG)
            </h1>
            <p className="text-muted-foreground mt-1">
              {docs.length} documento{docs.length !== 1 ? "s" : ""} indexado{docs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
            >
              {seedMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              Popular conteúdo canônico
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => reindexMutation.mutate({ force: false })}
              disabled={reindexMutation.isPending}
            >
              {reindexMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Reindexar embeddings
            </Button>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Documento
            </Button>
          </div>
        </div>

        {/* Busca semântica */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-primary" />
              Busca semântica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Digite uma pergunta ou termo para testar o RAG do Jarvis..."
              />
              <Button
                onClick={runSearch}
                disabled={searchInput.trim().length < 2 || isSearching}
                className="gap-2 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </Button>
            </div>

            {searchQuery.trim().length >= 2 && (
              <div className="space-y-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhum resultado relevante encontrado para "{searchQuery}".
                  </p>
                ) : (
                  searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border p-3 flex flex-col gap-1"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.title}</span>
                        <Badge variant="outline" className="text-xs">{r.category}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          score {r.score.toFixed(3)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.snippet}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de documentos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : docs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum documento na base</h3>
              <p className="text-muted-foreground mb-4">
                Adicione o primeiro documento para alimentar o RAG do Jarvis.
              </p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar primeiro documento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-4 font-medium">Título</th>
                      <th className="p-4 font-medium">Categoria</th>
                      <th className="p-4 font-medium">Tags</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`border-b last:border-0 ${doc.isActive === 0 ? "opacity-60" : ""}`}
                      >
                        <td className="p-4 font-medium max-w-xs">
                          <div className="truncate">{doc.title}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {splitTags(doc.tags).length === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              splitTags(doc.tags).map((t) => (
                                <Badge key={t} variant="secondary" className="text-xs gap-1">
                                  <TagIcon className="w-3 h-3" />
                                  {t}
                                </Badge>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={doc.isActive === 1 ? "default" : "outline"}
                            className="text-xs"
                          >
                            {doc.isActive === 1 ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(doc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Como funciona a metodologia SET7"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Ex: Metodologia"
                  />
                </div>
                <div>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="Ex: set7, impacto, esg"
                  />
                </div>
              </div>
              <div>
                <Label>Conteúdo *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Texto completo do documento que será indexado pelo RAG..."
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Adicionar documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Tem certeza que deseja remover este documento da base de conhecimento? Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && removeMutation.mutate({ id: deleteConfirm })}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
