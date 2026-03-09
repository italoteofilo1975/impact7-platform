import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Search,
  FileText,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Loader2,
  ArrowRight,
  X,
  Filter,
} from "lucide-react";

type SearchType = "cases" | "blog" | "courses" | "forum";

const typeConfig: Record<
  SearchType,
  { label: string; icon: typeof FileText; color: string; badgeClass: string }
> = {
  cases: {
    label: "Cases",
    icon: FileText,
    color: "text-blue-400",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  blog: {
    label: "Blog",
    icon: BookOpen,
    color: "text-purple-400",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  courses: {
    label: "Cursos",
    icon: GraduationCap,
    color: "text-amber-400",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  forum: {
    label: "Fórum",
    icon: MessageSquare,
    color: "text-green-400",
    badgeClass: "bg-green-500/20 text-green-300 border-green-500/30",
  },
};

const resultTypeMap: Record<string, SearchType> = {
  case: "cases",
  blog: "blog",
  course: "courses",
  forum: "forum",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Busca() {
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") ?? "";
  });
  const [activeTypes, setActiveTypes] = useState<SearchType[]>(["cases", "blog", "courses", "forum"]);
  const debouncedQuery = useDebounce(query, 350);

  const enabled = debouncedQuery.trim().length >= 2;

  const { data, isLoading, isFetching } = trpc.search.global.useQuery(
    { query: debouncedQuery.trim(), types: activeTypes, limit: 30 },
    { enabled }
  );

  // Update URL when query changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (debouncedQuery.trim()) {
      url.searchParams.set("q", debouncedQuery.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url.toString());
  }, [debouncedQuery]);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function toggleType(type: SearchType) {
    setActiveTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1
          ? prev.filter((t) => t !== type)
          : prev
        : [...prev, type]
    );
  }

  const results = data?.results ?? [];
  const total = data?.total ?? 0;

  // Group results by type
  const grouped: Partial<Record<SearchType, typeof results>> = {};
  for (const r of results) {
    const t = resultTypeMap[r.type] as SearchType;
    if (!grouped[t]) grouped[t] = [];
    grouped[t]!.push(r);
  }

  const popularSearches = [
    "S-ROI", "SET7", "impacto social", "ESG", "ODS", "calculadora",
    "mentoria", "cases", "fórum", "cursos",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-white/10 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar em cases, blog, cursos, fórum..."
              className="pl-12 pr-12 py-6 text-lg bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-emerald-500"
            />
            {(isLoading || isFetching) && (
              <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-spin" />
            )}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            {(Object.keys(typeConfig) as SearchType[]).map((type) => {
              const cfg = typeConfig[type];
              const isActive = activeTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-all ${
                    isActive
                      ? cfg.badgeClass + " border-current"
                      : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Empty state — no query */}
        {!query.trim() && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <Search className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Busca Global IMPACT7</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Pesquise em toda a plataforma: cases de impacto, artigos do blog,
              cursos e discussões do fórum.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Query too short */}
        {query.trim().length === 1 && (
          <p className="text-center text-gray-400 py-8">
            Digite pelo menos 2 caracteres para buscar...
          </p>
        )}

        {/* Loading */}
        {enabled && isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        )}

        {/* No results */}
        {enabled && !isLoading && results.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-400 mb-4">
              Não encontramos nada para <strong>"{debouncedQuery}"</strong>.
              Tente outros termos ou ajuste os filtros.
            </p>
            <Button
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10"
              onClick={() => setQuery("")}
            >
              Limpar busca
            </Button>
          </div>
        )}

        {/* Results */}
        {enabled && !isLoading && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-6">
              <span className="text-white font-semibold">{total}</span> resultado{total !== 1 ? "s" : ""} para{" "}
              <span className="text-emerald-400">"{debouncedQuery}"</span>
            </p>

            {(Object.keys(typeConfig) as SearchType[]).map((type) => {
              const group = grouped[type];
              if (!group || group.length === 0) return null;
              const cfg = typeConfig[type];

              return (
                <div key={type} className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">
                      {cfg.label}
                    </h3>
                    <Badge className={`text-xs border ${cfg.badgeClass}`}>
                      {group.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {group.map((result) => (
                      <Link key={`${result.type}-${result.id}`} href={result.url}>
                        <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/8 transition-all cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white group-hover:text-emerald-300 transition-colors truncate">
                                  {result.title}
                                </h4>
                                {result.excerpt && (
                                  <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                    {result.excerpt}
                                  </p>
                                )}
                                {result.meta && (
                                  <span className="text-xs text-gray-500 mt-1 block">
                                    {result.meta}
                                  </span>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors shrink-0 mt-0.5" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
