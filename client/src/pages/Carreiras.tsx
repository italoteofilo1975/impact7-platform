import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Zap,
  Globe,
  ArrowRight,
  Search,
  Building2,
  GraduationCap,
  Coffee,
  Laptop,
  Loader2,
  BriefcaseBusiness,
  Bell,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const companyBenefits = [
  { icon: Heart, title: "Propósito Real", description: "Trabalhe em projetos que geram impacto social mensurável no Brasil e no mundo." },
  { icon: Zap, title: "Crescimento Acelerado", description: "Ambiente de startup com oportunidades reais de desenvolvimento e liderança." },
  { icon: Globe, title: "Trabalho Remoto", description: "Flexibilidade para trabalhar de qualquer lugar, com encontros presenciais estratégicos." },
  { icon: GraduationCap, title: "Aprendizado Contínuo", description: "Orçamento dedicado para cursos, conferências e certificações." },
  { icon: Coffee, title: "Cultura Humana", description: "Ambiente inclusivo, diverso e psicologicamente seguro para todos." },
  { icon: Laptop, title: "Equipamento Top", description: "Orçamento para montar seu home office dos sonhos." },
];

const companyValues = [
  { icon: Users, title: "Colaboração", description: "Acreditamos que os melhores resultados vêm de equipes diversas e colaborativas." },
  { icon: Heart, title: "Impacto", description: "Cada decisão é guiada pela pergunta: isso gera impacto real?" },
  { icon: Zap, title: "Inovação", description: "Questionamos o status quo e buscamos soluções criativas para problemas complexos." },
];

const deptColor: Record<string, string> = {
  "Engenharia": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Design": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Impacto & Pesquisa": "bg-green-500/20 text-green-300 border-green-500/30",
  "Customer Success": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Marketing": "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

function getDeptColor(dept: string | null | undefined) {
  if (!dept) return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  return deptColor[dept] ?? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
        <BriefcaseBusiness className="w-10 h-10 text-emerald-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Nenhuma vaga aberta no momento</h3>
      <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
        Estamos sempre em busca de talentos extraordinários. Cadastre seu interesse e
        seja o primeiro a saber quando abrirmos novas posições.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-1"
        />
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shrink-0">
          <Bell className="w-4 h-4" />
          Avisar-me
        </Button>
      </div>
      <p className="text-xs text-gray-600 mt-3">Sem spam. Cancelamento a qualquer momento.</p>
    </div>
  );
}

export default function Carreiras() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: jobs = [], isLoading } = trpc.careers.list.useQuery();

  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean))) as string[];

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !selectedDept || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950/30 to-gray-900 py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm px-4 py-1.5">
            Faça parte da equipe
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Construa o futuro do{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              impacto social
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Na IMPACT7, cada linha de código, cada análise e cada conversa contribui para
            um mundo mais justo e sustentável. Venha trabalhar com propósito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
              onClick={() => document.getElementById("vagas")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver vagas abertas <ArrowRight className="w-4 h-4" />
            </Button>
            <Link href="/sobre">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                Conhecer a empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que nos <span className="text-emerald-400">move</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyValues.map((value) => (
              <Card key={value.title} className="bg-white/5 border-white/10 text-center p-6">
                <CardContent className="pt-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <value.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Por que trabalhar na <span className="text-emerald-400">IMPACT7</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Oferecemos muito mais do que um salário competitivo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <benefit.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="vagas" className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold">
                Vagas <span className="text-emerald-400">abertas</span>
              </h2>
              {!isLoading && jobs.length > 0 && (
                <p className="text-gray-400 mt-1">
                  {filtered.length} vaga{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {jobs.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar vagas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 w-64"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedDept === null ? "default" : "outline"}
                    onClick={() => setSelectedDept(null)}
                    className={selectedDept === null ? "bg-emerald-600 hover:bg-emerald-500" : "border-white/20 text-gray-300 hover:bg-white/10"}
                  >
                    Todas
                  </Button>
                  {departments.map((dept) => (
                    <Button
                      key={dept}
                      size="sm"
                      variant={selectedDept === dept ? "default" : "outline"}
                      onClick={() => setSelectedDept(selectedDept === dept ? null : dept)}
                      className={selectedDept === dept ? "bg-emerald-600 hover:bg-emerald-500" : "border-white/20 text-gray-300 hover:bg-white/10"}
                    >
                      {dept}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          )}

          {!isLoading && jobs.length === 0 && <EmptyState />}

          {!isLoading && jobs.length > 0 && filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-400 mb-4">Tente ajustar os filtros ou a busca.</p>
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10"
                onClick={() => { setSearchQuery(""); setSelectedDept(null); }}
              >
                Limpar filtros
              </Button>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((job) => {
                const isExpanded = expandedId === job.id;
                const requirements = Array.isArray(job.requirements) ? job.requirements : [];
                const jobBenefits = Array.isArray(job.benefits) ? job.benefits : [];

                return (
                  <Card
                    key={job.id}
                    className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : job.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {job.isNew === 1 && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                                Nova
                              </Badge>
                            )}
                            {job.department && (
                              <Badge className={`text-xs border ${getDeptColor(job.department)}`}>
                                {job.department}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl text-white">{job.title}</CardTitle>
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (job.applyUrl) {
                              window.open(job.applyUrl, "_blank");
                            } else {
                              window.location.href = "mailto:carreiras@impact7.com.br?subject=Candidatura: " + job.title;
                            }
                          }}
                        >
                          Candidatar-se
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                        {job.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {job.type}
                          </span>
                        )}
                        {job.salaryRange && (
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            {job.salaryRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          IMPACT7
                        </span>
                      </div>
                    </CardHeader>

                    {job.description && (
                      <CardContent className="pt-0 pb-3">
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                          {job.description}
                        </p>
                      </CardContent>
                    )}

                    {isExpanded && (
                      <CardContent className="pt-0 border-t border-white/10 mt-2">
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {requirements.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-emerald-400" />
                                Requisitos
                              </h4>
                              <ul className="space-y-2">
                                {requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {jobBenefits.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-emerald-400" />
                                Benefícios
                              </h4>
                              <ul className="space-y-2">
                                {jobBenefits.map((ben, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                    {ben}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 flex gap-3">
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (job.applyUrl) {
                                window.open(job.applyUrl, "_blank");
                              } else {
                                window.location.href = "mailto:carreiras@impact7.com.br?subject=Candidatura: " + job.title;
                              }
                            }}
                          >
                            Candidatar-se agora <ArrowRight className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/20 text-gray-300 hover:bg-white/10"
                            onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                          >
                            Fechar
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 rounded-2xl p-10 border border-emerald-500/20">
            <h2 className="text-3xl font-bold mb-4">Não encontrou a vaga ideal?</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Estamos sempre abertos a talentos excepcionais. Envie seu currículo e
              conte-nos como você pode contribuir para nossa missão.
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
              onClick={() => window.location.href = "mailto:carreiras@impact7.com.br?subject=Candidatura Espontânea"}
            >
              Enviar candidatura espontânea <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
