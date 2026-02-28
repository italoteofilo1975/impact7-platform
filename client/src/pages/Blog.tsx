import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Clock, User, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  category?: string | null;
  readTime?: string | null;
  publishedAt?: number | null;
  isFeatured?: number | null;
}

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function PostSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: categoriesData } = trpc.blog.getCategories.useQuery();
  const { data, isLoading, error } = trpc.blog.list.useQuery({ page, limit: 9, category: selectedCategory });

  const posts: BlogPost[] = (data?.posts ?? []) as BlogPost[];
  const totalPages = data?.pages ?? 1;
  const categories = categoriesData ?? [];

  const filtered = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  const featured = filtered.filter(p => p.isFeatured);
  const regular = filtered.filter(p => !p.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            <BookOpen className="w-3 h-3 mr-1" />
            Blog IMPACT7
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Conhecimento em <span className="text-primary">Impacto Social</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Artigos, metodologias e casos práticos para quem quer medir, comunicar e ampliar o impacto social.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar artigos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filtros por categoria */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant={!selectedCategory ? "default" : "outline"} size="sm"
              onClick={() => { setSelectedCategory(undefined); setPage(1); }}>
              Todos
            </Button>
            {categories.map(cat => (
              <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm"
                onClick={() => { setSelectedCategory(cat); setPage(1); }}>
                {cat}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-6 bg-destructive/10 rounded-lg text-destructive mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar artigos. Tente novamente em instantes.</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {search ? `Nenhum resultado para "${search}"` : "Ainda não há artigos publicados nesta categoria."}
            </p>
            {(search || selectedCategory) && (
              <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(undefined); }}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Artigos em destaque */}
        {!isLoading && featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.slice(0, 2).map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                    {post.coverImage && (
                      <div className="relative h-56 overflow-hidden">
                        <img src={post.coverImage} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {post.category && (
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{post.category}</Badge>
                        )}
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      {!post.coverImage && post.category && (
                        <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                      )}
                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      {post.excerpt && <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {post.authorName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.authorName}</span>}
                        {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>}
                        {post.readTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ler artigo <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid de artigos regulares */}
        {!isLoading && regular.length > 0 && (
          <div>
            {featured.length > 0 && <h2 className="text-2xl font-bold mb-6">Todos os Artigos</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
                    {post.coverImage && (
                      <div className="h-44 overflow-hidden">
                        <img src={post.coverImage} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardHeader className="pb-2 flex-shrink-0">
                      {post.category && <Badge variant="secondary" className="w-fit mb-1 text-xs">{post.category}</Badge>}
                      <h3 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {post.excerpt && <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>}
                        {post.readTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>}
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <span className="text-sm text-muted-foreground px-4">Página {page} de {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Receba Novos Artigos por Email</h2>
          <p className="opacity-90 mb-6">Inscreva-se e receba conteúdo exclusivo sobre impacto social.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input type="email" placeholder="seu@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            <Button variant="secondary">Inscrever</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
