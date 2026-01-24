import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Send, MessageSquare, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "contato@impact7.com.br",
    link: "mailto:contato@impact7.com.br",
  },
  {
    icon: Phone,
    title: "WhatsApp",
    value: "+55 (11) 99999-9999",
    link: "https://wa.me/5511999999999",
  },
  {
    icon: MapPin,
    title: "Localização",
    value: "São Paulo, SP - Brasil",
    link: null,
  },
  {
    icon: Clock,
    title: "Horário",
    value: "Seg-Sex: 9h às 18h",
    link: null,
  },
];

const subjects = [
  { value: "consultoria", label: "Consultoria em Impacto Social" },
  { value: "calculadora", label: "Dúvidas sobre a Calculadora" },
  { value: "parceria", label: "Proposta de Parceria" },
  { value: "imprensa", label: "Imprensa / Mídia" },
  { value: "outro", label: "Outro Assunto" },
];

export default function Contato() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Mensagem enviada com sucesso!");
      setFormData({ name: "", email: "", phone: "", organization: "", subject: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await contactMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject || undefined,
        message: formData.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />
      
      <main className="pt-16">
        {/* Hero */}
        <section className="gradient-hero text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-white/60 hover:text-white text-sm">Home</Link>
              <span className="text-white/40">/</span>
              <span className="text-sm">Contato</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-4">
              <MessageSquare className="w-4 h-4" />
              Fale Conosco
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-white/80 max-w-2xl">
              Estamos prontos para ajudar você a maximizar o impacto social do seu projeto.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-card border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{info.title}</h4>
                    {info.link ? (
                      <a href={info.link} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{info.value}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Form */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Envie sua Mensagem</h2>
                <p className="text-muted-foreground mb-8">
                  Preencha o formulário abaixo e retornaremos em até 24 horas úteis.
                </p>

                {isSubmitted ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Mensagem Enviada!</h3>
                      <p className="text-muted-foreground mb-6">
                        Obrigado pelo contato. Nossa equipe retornará em breve.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline">
                        Enviar Nova Mensagem
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo *</Label>
                            <Input
                              id="name"
                              placeholder="Seu nome"
                              value={formData.name}
                              onChange={(e) => handleChange("name", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              value={formData.email}
                              onChange={(e) => handleChange("email", e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              placeholder="(11) 99999-9999"
                              value={formData.phone}
                              onChange={(e) => handleChange("phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="organization">Organização</Label>
                            <Input
                              id="organization"
                              placeholder="Nome da organização"
                              value={formData.organization}
                              onChange={(e) => handleChange("organization", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Assunto</Label>
                          <Select value={formData.subject} onValueChange={(v) => handleChange("subject", v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um assunto" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Mensagem *</Label>
                          <Textarea
                            id="message"
                            placeholder="Descreva como podemos ajudar..."
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            rows={5}
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full gradient-orange text-white border-0" 
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Enviando...</>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Enviar Mensagem
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: Additional Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Agende uma Consultoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Prefere uma conversa mais aprofundada? Agende uma sessão de consultoria 
                      gratuita de 30 minutos com nossa equipe.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Horário
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Perguntas Frequentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Quanto custa uma consultoria?</h4>
                      <p className="text-sm text-muted-foreground">
                        Oferecemos uma sessão inicial gratuita. Os valores de projetos 
                        variam conforme escopo e complexidade.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Vocês atendem todo o Brasil?</h4>
                      <p className="text-sm text-muted-foreground">
                        Sim, atendemos projetos em todo o território nacional, 
                        com opções presenciais e remotas.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Qual o prazo de resposta?</h4>
                      <p className="text-sm text-muted-foreground">
                        Respondemos todas as mensagens em até 24 horas úteis.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">Precisa de Ajuda Imediata?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Nossa equipe está disponível via WhatsApp para atendimento rápido.
                    </p>
                    <a 
                      href="https://wa.me/5511999999999" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full gradient-orange text-white border-0">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Falar no WhatsApp
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
