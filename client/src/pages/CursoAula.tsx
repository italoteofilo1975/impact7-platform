/**
 * CursoAula.tsx — Página de aula individual
 * Exibe conteúdo da aula, progresso, navegação entre aulas e marcação de conclusão
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Play,
  BookOpen,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { toast } from "sonner";

export default function CursoAula() {
  const { user } = useAuth();
  const [, params] = useRoute("/cursos/:courseId/aulas/:lessonId");
  const [, navigate] = useLocation();

  const courseId = parseInt(params?.courseId ?? "0");
  const lessonId = parseInt(params?.lessonId ?? "0");

  const { data: course, isLoading: courseLoading } = trpc.courses.getById.useQuery(
    { id: courseId },
    { enabled: courseId > 0 }
  );

  const { data: lesson, isLoading: lessonLoading } = trpc.courses.getLesson.useQuery(
    { lessonId, courseId },
    { enabled: lessonId > 0 && courseId > 0 }
  );

  const utils = trpc.useUtils();
  const markComplete = trpc.courses.markLessonComplete.useMutation({
    onSuccess: (data) => {
      toast.success(`Aula concluída! Progresso: ${data.progress}%`);
      utils.courses.getById.invalidate({ id: courseId });
      utils.courses.getMyEnrollments.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao marcar aula como concluída");
    },
  });

  if (!courseId || !lessonId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Aula não encontrada.</p>
          <Link href="/cursos">
            <Button variant="link" className="mt-2">Voltar para Cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (courseLoading || lessonLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-6xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Aula não encontrada.</p>
          <Link href="/cursos">
            <Button variant="link" className="mt-2">Voltar para Cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Conteúdo Exclusivo</h2>
          <p className="text-muted-foreground mb-6">
            Esta aula está disponível apenas para alunos matriculados no curso.
          </p>
          <Link href="/cursos">
            <Button>Ver Cursos Disponíveis</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lessons = course?.lessons ?? [];
  const currentIndex = lessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Verificar aulas concluídas via enrollment
  const enrollment = course?.enrollment as any;
  const completedLessons: number[] = JSON.parse(enrollment?.completedLessons || '[]');
  const isCompleted = completedLessons.includes(lessonId);
  const progress = enrollment?.progress ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/cursos">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Cursos</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">
                {course?.title}
              </span>
            </div>
          </div>
          {enrollment && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">{progress}%</span>
              <Progress value={progress} className="w-20 h-2" />
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-6xl py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conteúdo principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Player / Conteúdo da aula */}
            <div className="rounded-xl border bg-card overflow-hidden">
              {lesson.videoUrl ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Play className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm">Conteúdo em texto abaixo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Título e metadados */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold leading-tight">{lesson.title}</h1>
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 flex-shrink-0">
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Concluída
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {lesson.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {lesson.duration} min
                  </span>
                )}
                {lesson.isFree ? (
                  <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                    Aula Gratuita
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Conteúdo textual */}
            {lesson.content && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Conteúdo da Aula
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {lesson.content.split('\n').map((paragraph: string, i: number) => (
                    paragraph.trim() ? (
                      <p key={i} className="mb-3 text-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* Ações de navegação */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {prevLesson ? (
                <Link href={`/cursos/${courseId}/aulas/${prevLesson.id}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Aula Anterior</span>
                    <span className="sm:hidden">Anterior</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                {user && !isCompleted && (
                  <Button
                    onClick={() => markComplete.mutate({ lessonId, courseId })}
                    disabled={markComplete.isPending}
                    className="gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Marcar como Concluída</span>
                    <span className="sm:hidden">Concluir</span>
                  </Button>
                )}
                {nextLesson ? (
                  <Link href={`/cursos/${courseId}/aulas/${nextLesson.id}`}>
                    <Button className="gap-2">
                      <span className="hidden sm:inline">Próxima Aula</span>
                      <span className="sm:hidden">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Sidebar: lista de aulas */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card sticky top-20">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-sm">Aulas do Curso</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedLessons.length}/{lessons.length} concluídas
                </p>
              </div>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-2 space-y-1">
                  {lessons.map((l: any, idx: number) => {
                    const isCurrentLesson = l.id === lessonId;
                    const isDone = completedLessons.includes(l.id);
                    const isAccessible = l.isFree || !!enrollment;
                    return (
                      <div key={l.id}>
                        {isAccessible ? (
                          <Link href={`/cursos/${courseId}/aulas/${l.id}`}>
                            <div
                              className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                isCurrentLesson
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                                  isDone
                                    ? 'bg-green-100 text-green-600'
                                    : isCurrentLesson
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium leading-tight ${
                                  isCurrentLesson ? 'text-primary' : ''
                                }`}>
                                  {l.title}
                                </p>
                                {l.duration && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {l.duration} min
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-start gap-2 p-2.5 rounded-lg opacity-50 cursor-not-allowed">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium leading-tight text-muted-foreground">
                                {l.title}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
