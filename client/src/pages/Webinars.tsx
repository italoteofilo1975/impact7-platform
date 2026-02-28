import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Users, Video, AlertCircle, Search, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface Event {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  eventType?: string | null;
  location?: string | null;
  virtualLink?: string | null;
  startsAt: number;
  endsAt: number;
  maxAttendees?: number | null;
  registrationDeadline?: number | null;
  featuredImage?: string | null;
  status?: string | null;
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function EventSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
      <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-5/6" /></CardContent>
      <CardFooter><Skeleton className="h-9 w-32" /></CardFooter>
    </Card>
  );
}

export default function Webinars() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [registerEvent, setRegisterEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", company: "" });
  const [registered, setRegistered] = useState<number[]>([]);

  const { data, isLoading, error } = trpc.events.list.useQuery({ limit: 20, upcoming: true });
  const registerMutation = trpc.events.register.useMutation({
    onSuccess: (_, vars) => {
      setRegistered(prev => [...prev, vars.eventId]);
      setRegisterEvent(null);
      toast.success('Inscrição confirmada! Você receberá um e-mail de confirmação em breve.');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const events: Event[] = (data?.events ?? []) as Event[];
  const eventTypes = Array.from(new Set(events.map(e => e.eventType).filter(Boolean))) as string[];

  const filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchType = !selectedType || e.eventType === selectedType;
    return matchSearch && matchType;
  });

  const handleRegister = () => {
    if (!registerEvent) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Preencha nome e e-mail');
      return;
    }
    registerMutation.mutate({ eventId: registerEvent.id, name: form.name, email: form.email, company: form.company });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            <Video className="w-3 h-3 mr-1" />
            Webinars & Eventos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Aprenda com <span className="text-primary">Especialistas</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Webinars ao vivo, workshops práticos e eventos presenciais sobre impacto social e inovação.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar eventos..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-10 h-12" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filtros */}
        {eventTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant={!selectedType ? "default" : "outline"} size="sm"
              onClick={() => setSelectedType(undefined)}>Todos</Button>
            {eventTypes.map(t => (
              <Button key={t} variant={selectedType === t ? "default" : "outline"} size="sm"
                onClick={() => setSelectedType(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-6 bg-destructive/10 rounded-lg text-destructive mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar eventos. Tente novamente em instantes.</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">Não há eventos agendados no momento. Volte em breve!</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => {
              const isRegistered = registered.includes(event.id);
              const isPast = event.endsAt < Date.now();
              const isDeadlinePassed = event.registrationDeadline ? event.registrationDeadline < Date.now() : false;

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                  {event.featuredImage ? (
                    <div className="h-48 overflow-hidden">
                      <img src={event.featuredImage} alt={event.title}
                        className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {event.eventType === "webinar" || event.virtualLink
                        ? <Video className="w-12 h-12 text-primary/40" />
                        : <Calendar className="w-12 h-12 text-primary/40" />}
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      {event.eventType && (
                        <Badge variant="secondary" className="text-xs capitalize">{event.eventType}</Badge>
                      )}
                      {event.virtualLink && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/30">Online</Badge>
                      )}
                      {isPast && <Badge variant="outline" className="text-xs text-muted-foreground">Encerrado</Badge>}
                    </div>
                    <h3 className="font-bold leading-tight line-clamp-2">{event.title}</h3>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{formatDateTime(event.startsAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>Até {formatDateTime(event.endsAt)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      {event.maxAttendees && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span>Máx. {event.maxAttendees} participantes</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isRegistered ? (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Inscrito
                      </Button>
                    ) : isPast || isDeadlinePassed ? (
                      <Button className="w-full" variant="outline" disabled>
                        {isPast ? "Evento encerrado" : "Inscrições encerradas"}
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => {
                        setForm({ name: user?.name ?? "", email: user?.email ?? "", company: "" });
                        setRegisterEvent(event);
                      }}>
                        Inscrever-se
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de inscrição */}
      <Dialog open={!!registerEvent} onOpenChange={() => setRegisterEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inscrição no Evento</DialogTitle>
            <DialogDescription>{registerEvent?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="reg-name">Nome completo *</Label>
              <Input id="reg-name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Seu nome" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="reg-email">E-mail *</Label>
              <Input id="reg-email" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="seu@email.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="reg-company">Organização (opcional)</Label>
              <Input id="reg-company" value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="Sua empresa ou organização" className="mt-1" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setRegisterEvent(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleRegister} disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Inscrevendo..." : "Confirmar inscrição"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
