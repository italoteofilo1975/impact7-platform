import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  Bell,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

interface Webinar {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  speaker: string;
  speakerRole: string;
  attendees: number;
  status: "upcoming" | "live" | "recorded";
  topics: string[];
  thumbnail?: string;
}

const webinars: Webinar[] = [
  {
    id: 1,
    title: "Introdução ao Método IMPACT7",
    description:
      "Aprenda os fundamentos do método e como aplicá-lo em seus projetos de impacto social.",
    date: "2026-02-15",
    time: "14:00",
    duration: "1h30",
    speaker: "Dr. João Silva",
    speakerRole: "Fundador IMPACT7",
    attendees: 245,
    status: "upcoming",
    topics: ["Fundamentos", "SROI", "Casos de Uso"],
  },
  {
    id: 2,
    title: "Calculando SROI na Prática",
    description:
      "Workshop prático sobre como calcular o Retorno Social sobre Investimento.",
    date: "2026-02-22",
    time: "10:00",
    duration: "2h",
    speaker: "Maria Santos",
    speakerRole: "Head de Metodologia",
    attendees: 189,
    status: "upcoming",
    topics: ["SROI", "Métricas", "Excel", "Ferramentas"],
  },
  {
    id: 3,
    title: "Tokens de Impacto: O Futuro da Mensuração",
    description:
      "Como a tokenização está revolucionando a forma de medir e recompensar impacto social.",
    date: "2026-01-10",
    time: "15:00",
    duration: "1h",
    speaker: "Pedro Costa",
    speakerRole: "CTO IMPACT7",
    attendees: 312,
    status: "recorded",
    topics: ["Blockchain", "Tokens", "Gamificação"],
  },
  {
    id: 4,
    title: "Cases de Sucesso: Educação",
    description:
      "Apresentação de casos reais de projetos educacionais que utilizaram o IMPACT7.",
    date: "2026-01-05",
    time: "14:00",
    duration: "1h30",
    speaker: "Ana Oliveira",
    speakerRole: "Consultora Sênior",
    attendees: 178,
    status: "recorded",
    topics: ["Educação", "Cases", "Resultados"],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "live":
      return <Badge className="bg-red-500 animate-pulse">AO VIVO</Badge>;
    case "upcoming":
      return <Badge className="bg-blue-500">Em Breve</Badge>;
    case "recorded":
      return <Badge variant="secondary">Gravado</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function Webinars() {
  const upcomingWebinars = webinars.filter((w) => w.status === "upcoming" || w.status === "live");
  const recordedWebinars = webinars.filter((w) => w.status === "recorded");

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Video className="h-12 w-12 text-primary" />
            </div>
          </div>
          <Badge className="mb-4">Webinars & Eventos</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Aprenda com os Especialistas
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Webinars gratuitos, workshops práticos e eventos exclusivos sobre
            impacto social e o Método IMPACT7
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button>
              <Bell className="mr-2 h-4 w-4" />
              Receber Notificações
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendário
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-muted-foreground">Webinars Realizados</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5.000+</p>
              <p className="text-muted-foreground">Participantes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8</p>
              <p className="text-muted-foreground">Avaliação Média</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-muted-foreground">Gratuito</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      {upcomingWebinars.length > 0 && (
        <section className="py-16 px-4">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Próximos Eventos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingWebinars.map((webinar) => (
                <Card key={webinar.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {getStatusBadge(webinar.status)}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {webinar.attendees} inscritos
                      </div>
                    </div>
                    <CardTitle className="mt-4">{webinar.title}</CardTitle>
                    <CardDescription>{webinar.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(webinar.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {webinar.time} ({webinar.duration})
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {webinar.speaker.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{webinar.speaker}</p>
                          <p className="text-sm text-muted-foreground">
                            {webinar.speakerRole}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {webinar.topics.map((topic, index) => (
                          <Badge key={index} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full">
                        <Bell className="mr-2 h-4 w-4" />
                        Inscrever-se Gratuitamente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recorded Webinars */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Webinars Gravados</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordedWebinars.map((webinar) => (
              <Card key={webinar.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    {getStatusBadge(webinar.status)}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {webinar.attendees} visualizações
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-lg">{webinar.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {webinar.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {webinar.speaker.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{webinar.speaker}</p>
                        <p className="text-xs text-muted-foreground">
                          {webinar.duration}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {webinar.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Assistir Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Ver Todos os Webinars
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por Que Participar?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">100% Gratuito</h3>
                  <p className="text-muted-foreground">
                    Todos os webinars são gratuitos e abertos ao público
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Certificado de Participação</h3>
                  <p className="text-muted-foreground">
                    Receba certificado ao completar cada webinar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Material Complementar</h3>
                  <p className="text-muted-foreground">
                    Slides, templates e recursos exclusivos
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Q&A ao Vivo</h3>
                  <p className="text-muted-foreground">
                    Tire suas dúvidas diretamente com os especialistas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Networking</h3>
                  <p className="text-muted-foreground">
                    Conecte-se com outros profissionais do setor
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Acesso Vitalício</h3>
                  <p className="text-muted-foreground">
                    Assista às gravações quando quiser
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Não Perca Nenhum Evento
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Inscreva-se para receber notificações sobre novos webinars e eventos
            exclusivos
          </p>
          <Button size="lg" variant="secondary">
            <Bell className="mr-2 h-4 w-4" />
            Ativar Notificações
          </Button>
        </div>
      </section>
    </div>
  );
}
