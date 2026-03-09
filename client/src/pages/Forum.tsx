/**
 * Forum.tsx — Fórum da Comunidade IMPACT7
 * Listagem de tópicos, criação autenticada, respostas e filtros por categoria
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Plus,
  Pin,
  Lock,
  Eye,
  ThumbsUp,
  Clock,
  Search,
  ChevronRight,
  ArrowLeft,
  Send,
  User,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(ts).toLocaleDateString("pt-BR");
}

// ─── Componente de Tópico Individual ────────────────────────────────────────
function TopicView({ topicSlug, onBack }: { topicSlug: string; onBack: () => void }) {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const utils = trpc.useUtils();

  const { data: topic, isLoading } = trpc.forum.getTopicBySlug.useQuery({ slug: topicSlug });

  const createReply = trpc.forum.createReply.useMutation({
    onSuccess: () => {
      setReplyContent("");
      utils.forum.getTopicBySlug.invalidate({ slug: topicSlug });
      toast.success("Resposta publicada!");
    },
    onError: (err) => toast.error(err.message || "Erro ao publicar resposta"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tópico não encontrado.</p>
        <Button variant="link" onClick={onBack}>Voltar ao Fórum</Button>
      </div>
    );
  }

  const replies = (topic as any).replies ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 mt-0.5 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Fórum
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {(topic as any).isPinned && <Badge variant="secondary"><Pin className="w-3 h-3 mr-1" />Fixado</Badge>}
            {(topic as any).isLocked && <Badge variant="outline"><Lock className="w-3 h-3 mr-1" />Fechado</Badge>}
          </div>
          <h1 className="text-2xl font-bold leading-tight">{(topic as any).title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {(topic as any).authorName || "Anônimo"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo((topic as any).createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {(topic as any).viewCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo do tópico */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {((topic as any).content || "").split('\n').map((p: string, i: number) => (
              p.trim() ? <p key={i} className="mb-3">{p}</p> : null
            ))}
          </div>
          {(topic as any).tags && (topic as any).tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Tag className="w-3 h-3 text-muted-foreground" />
              {((topic as any).tags as string[]).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respostas */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          {replies.length} {replies.length === 1 ? "Resposta" : "Respostas"}
        </h3>
        {replies.map((reply: any) => (
          <Card key={reply.id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {(reply.authorName || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{reply.authorName || "Anônimo"}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert pl-10">
                {reply.content.split('\n').map((p: string, i: number) => (
                  p.trim() ? <p key={i} className="mb-2">{p}</p> : null
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de resposta */}
      {!(topic as any).isLocked ? (
        user ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sua Resposta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!replyContent.trim()) return toast.error("Escreva uma resposta");
                    createReply.mutate({ topicId: (topic as any).id, content: replyContent.trim() });
                  }}
                  disabled={createReply.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publicar Resposta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-3">Faça login para participar da discussão</p>
              <a href={getLoginUrl()}>
                <Button>Entrar na Comunidade</Button>
              </a>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Este tópico está fechado para novas respostas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function Forum() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", content: "", categoryId: "", tags: "" });

  const utils = trpc.useUtils();

  const { data: categories, isLoading: catsLoading } = trpc.forum.getCategories.useQuery();
  const { data: topicsData, isLoading: topicsLoading } = trpc.forum.getTopics.useQuery({
    categoryId: selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    limit: 30,
  });

  const createTopic = trpc.forum.createTopic.useMutation({
    onSuccess: () => {
      setShowNewTopicDialog(false);
      setNewTopic({ title: "", content: "", categoryId: "", tags: "" });
      utils.forum.getTopics.invalidate();
      toast.success("Tópico criado com sucesso!");
    },
    onError: (err) => toast.error(err.message || "Erro ao criar tópico"),
  });

  // Se um tópico está selecionado, mostrar a view do tópico
  if (selectedTopicSlug) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8">
          <TopicView topicSlug={selectedTopicSlug} onBack={() => setSelectedTopicSlug(null)} />
        </div>
      </div>
    );
  }

  const topics = (topicsData as any)?.topics ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b py-12">
        <div className="container max-w-5xl">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Fórum da Comunidade</h1>
              <p className="text-muted-foreground text-lg">
                Troque experiências, tire dúvidas e colabore com profissionais de impacto social.
              </p>
            </div>
            {user ? (
              <Button onClick={() => setShowNewTopicDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Tópico
              </Button>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Entrar para Participar
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container max-w-5xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: categorias */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Categorias
            </h3>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/50"
              }`}
            >
              Todos os Tópicos
            </button>
            {catsLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)
            ) : (
              (categories ?? []).map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(String(cat.id))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === String(cat.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="block">{cat.name}</span>
                  {cat.topicCount != null && (
                    <span className="text-xs text-muted-foreground">{cat.topicCount} tópicos</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Lista de tópicos */}
          <div className="lg:col-span-3 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópicos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tópicos */}
            {topicsLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : topics.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum tópico encontrado.</p>
                {user && (
                  <Button
                    variant="link"
                    onClick={() => setShowNewTopicDialog(true)}
                    className="mt-2"
                  >
                    Criar o primeiro tópico
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {topics.map((topic: any) => (
                  <Card
                    key={topic.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                    onClick={() => setSelectedTopicSlug(topic.slug)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {(topic.authorName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {topic.isPinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="w-2.5 h-2.5 mr-1" />Fixado
                              </Badge>
                            )}
                            {topic.isLocked && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-2.5 h-2.5 mr-1" />Fechado
                              </Badge>
                            )}
                            {topic.categoryName && (
                              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                {topic.categoryName}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm leading-tight mb-1 hover:text-primary transition-colors">
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{topic.authorName || "Anônimo"}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(topic.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {topic.replyCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {topic.viewCount || 0}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog: Novo Tópico */}
      <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Novo Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Qual é a sua dúvida ou tema?"
                value={newTopic.title}
                onChange={(e) => setNewTopic((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Categoria</label>
              <Select
                value={newTopic.categoryId}
                onValueChange={(v) => setNewTopic((p) => ({ ...p, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Conteúdo</label>
              <Textarea
                placeholder="Descreva sua dúvida ou tema em detalhes..."
                value={newTopic.content}
                onChange={(e) => setNewTopic((p) => ({ ...p, content: e.target.value }))}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
              <Input
                placeholder="ex: SROI, Educação, Metodologia"
                value={newTopic.tags}
                onChange={(e) => setNewTopic((p) => ({ ...p, tags: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!newTopic.title.trim()) return toast.error("Título obrigatório");
                if (!newTopic.content.trim()) return toast.error("Conteúdo obrigatório");
                if (!newTopic.categoryId) return toast.error("Selecione uma categoria");
                const tags = newTopic.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                createTopic.mutate({
                  title: newTopic.title.trim(),
                  content: newTopic.content.trim(),
                  categoryId: parseInt(newTopic.categoryId),
                });
              }}
              disabled={createTopic.isPending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Publicar Tópico
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
