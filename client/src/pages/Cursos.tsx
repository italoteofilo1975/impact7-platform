import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Clock, Users, Star, Search, AlertCircle, CheckCircle2, Play, Lock, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  level?: string | null;
  duration?: string | null;
  instructor?: string | null;
  coverImage?: string | null;
  category?: string | null;
  price?: number | null;
  isFree?: number | null;
  enrollmentCount?: number | null;
  rating?: number | null;
  lessonCount?: number | null;
}

function CourseSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full" />
      </CardHeader>
      <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-5/6" /></CardContent>
      <CardFooter><Skeleton className="h-9 w-32" /></CardFooter>
    </Card>
  );
}

export default function Cursos() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>();
  const [enrolled, setEnrolled] = useState<number[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const { data, isLoading, error } = trpc.courses.list.useQuery({
    limit: 20,
    level: selectedLevel as 'beginner' | 'intermediate' | 'advanced' | undefined,
  });

  const { data: courseDetail, isLoading: detailLoading } = trpc.courses.getById.useQuery(
    { id: selectedCourseId! },
    { enabled: selectedCourseId !== null }
  );

  const enrollMutation = trpc.courses.enroll.useMutation({
    onSuccess: (_, vars) => {
      setEnrolled(prev => [...prev, vars.courseId]);
      toast.success('Inscrição confirmada! Você já pode acessar o curso.');
    },
    onError: (e) => toast.error(e.message),
  });

  const courses: Course[] = (data?.courses ?? []) as Course[];
  const levels = Array.from(new Set(courses.map(c => c.level).filter(Boolean))) as string[];

  const filtered = search.trim()
    ? courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : courses;

  function handleEnroll(courseId: number) {
    if (!user) {
      toast.error('Faça login para se inscrever');
      return;
    }
    enrollMutation.mutate({ courseId });
  }

  const levelLabel: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            <BookOpen className="w-3 h-3 mr-1" />
            Cursos IMPACT7
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Aprenda a Medir e <span className="text-primary">Ampliar Impacto</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trilhas de aprendizado estruturadas para profissionais de impacto social.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar cursos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {levels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={!selectedLevel ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLevel(undefined)}
            >
              Todos os níveis
            </Button>
            {levels.map(l => (
              <Button
                key={l}
                variant={selectedLevel === l ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel(l)}
              >
                {levelLabel[l] ?? l}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-6 bg-destructive/10 rounded-lg text-destructive mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar cursos. Tente novamente.</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground">
              {search ? `Sem resultados para "${search}"` : 'Novos cursos em breve!'}
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => {
              const isEnrolled = enrolled.includes(course.id);
              return (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {course.coverImage ? (
                    <div className="h-44 overflow-hidden relative">
                      <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                      {course.isFree ? (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white">Gratuito</Badge>
                      ) : course.price ? (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          R$ {course.price}
                        </Badge>
                      ) : null}
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                      <BookOpen className="w-12 h-12 text-primary/40" />
                      {course.isFree && (
                        <Badge className="absolute top-3 left-3 bg-green-500 text-white">Gratuito</Badge>
                      )}
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      {course.level && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {levelLabel[course.level] ?? course.level}
                        </Badge>
                      )}
                      {course.category && (
                        <Badge variant="outline" className="text-xs">{course.category}</Badge>
                      )}
                    </div>
                    <h3 className="font-bold leading-tight line-clamp-2">{course.title}</h3>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {course.instructor && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" /><span>{course.instructor}</span>
                        </div>
                      )}
                      {course.lessonCount != null && course.lessonCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Play className="w-3 h-3" /><span>{course.lessonCount} aulas</span>
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" /><span>{course.duration} min</span>
                        </div>
                      )}
                      {course.rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{course.rating.toFixed(1)}</span>
                          {course.enrollmentCount != null && course.enrollmentCount > 0 && (
                            <span className="text-xs">({course.enrollmentCount} alunos)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourseId(course.id)}
                    >
                      <ChevronRight className="w-4 h-4 mr-1" /> Ver aulas
                    </Button>
                    {isEnrolled ? (
                      <Button className="flex-1" variant="outline" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Inscrito
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollMutation.isPending}
                      >
                        {course.isFree
                          ? 'Gratuito'
                          : course.price
                          ? `R$ ${course.price}`
                          : 'Inscrever-se'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalhes do curso com lista de aulas e progresso */}
      <Dialog
        open={selectedCourseId !== null}
        onOpenChange={(open) => { if (!open) setSelectedCourseId(null); }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {detailLoading ? 'Carregando...' : (courseDetail as any)?.title ?? ''}
            </DialogTitle>
          </DialogHeader>

          {detailLoading && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {!detailLoading && courseDetail && (() => {
            const cd = courseDetail as any;
            const isEnrolledInDetail = enrolled.includes(cd.id);
            const lessons: any[] = cd.lessons ?? [];
            const enrollment = cd.enrollment;
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {cd.level && (
                    <Badge variant="secondary" className="capitalize">
                      {levelLabel[cd.level] ?? cd.level}
                    </Badge>
                  )}
                  {cd.instructor && (
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />{cd.instructor}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <Play className="w-3 h-3 mr-1" />{lessons.length} aulas
                  </Badge>
                </div>

                {cd.description && (
                  <p className="text-sm text-muted-foreground">{cd.description}</p>
                )}

                {enrollment && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Seu progresso</span>
                      <span className="text-primary font-bold">{enrollment.progress ?? 0}%</span>
                    </div>
                    <Progress value={enrollment.progress ?? 0} className="h-2" />
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Conteúdo do Curso
                  </h4>
                  <ScrollArea className="h-72">
                    <div className="space-y-2 pr-4">
                      {lessons.map((lesson: any, idx: number) => {
                        const accessible = lesson.isFree || isEnrolledInDetail;
                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                              accessible
                                ? 'hover:bg-muted/50 cursor-pointer'
                                : 'opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                accessible
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {accessible ? idx + 1 : <Lock className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">{lesson.title}</p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  <Clock className="w-3 h-3 inline mr-1" />{lesson.duration} min
                                </p>
                              )}
                            </div>
                            {lesson.isFree ? (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                Grátis
                              </Badge>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {!isEnrolledInDetail && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      handleEnroll(cd.id);
                      setSelectedCourseId(null);
                    }}
                    disabled={enrollMutation.isPending}
                  >
                    {cd.price
                      ? `Comprar por R$ ${cd.price}`
                      : 'Inscrever-se gratuitamente'}
                  </Button>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
