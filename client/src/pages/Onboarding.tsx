import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Calculator,
  FileText,
  Award,
  Users,
  Sparkles,
  Target,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "Bem-vindo ao IMPACT7",
    description: "Vamos configurar sua conta em poucos passos",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Sobre sua Organização",
    description: "Conte-nos sobre seu trabalho",
    icon: Users,
  },
  {
    id: 3,
    title: "Seus Objetivos",
    description: "O que você quer alcançar?",
    icon: Target,
  },
  {
    id: 4,
    title: "Pronto para Começar",
    description: "Explore os recursos da plataforma",
    icon: Rocket,
  },
];

const sectors = [
  "Educação",
  "Saúde",
  "Meio Ambiente",
  "Desenvolvimento Comunitário",
  "Empregabilidade",
  "Cultura",
  "Assistência Social",
  "Outro",
];

const goals = [
  { id: "measure", label: "Medir impacto social dos projetos", icon: Calculator },
  { id: "report", label: "Gerar relatórios para stakeholders", icon: FileText },
  { id: "certify", label: "Obter certificação de impacto", icon: Award },
  { id: "improve", label: "Melhorar eficiência dos projetos", icon: Target },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    organizationName: "",
    sector: "",
    description: "",
    selectedGoals: [] as string[],
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalId)
        ? prev.selectedGoals.filter(g => g !== goalId)
        : [...prev.selectedGoals, goalId],
    }));
  };

  const handleComplete = () => {
    toast.success("Onboarding concluído! Bem-vindo ao IMPACT7.");
    setLocation("/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Olá, {user?.name || "Usuário"}!</h2>
              <p className="text-muted-foreground">
                Estamos felizes em tê-lo conosco. O IMPACT7 vai ajudá-lo a medir, 
                certificar e maximizar o impacto social dos seus projetos.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Card className="text-center p-4">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Calculadora de Impacto</p>
              </Card>
              <Card className="text-center p-4">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Relatórios SROI</p>
              </Card>
              <Card className="text-center p-4">
                <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Certificação Digital</p>
              </Card>
              <Card className="text-center p-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Comunidade</p>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Nome da Organização</Label>
                <Input
                  id="orgName"
                  placeholder="Ex: Instituto Educação para Todos"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sector">Setor de Atuação</Label>
                <Select 
                  value={formData.sector} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Breve Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Conte-nos sobre o trabalho da sua organização..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground text-center">
              Selecione os objetivos que você quer alcançar com o IMPACT7:
            </p>
            <div className="grid gap-3">
              {goals.map(goal => (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all ${
                    formData.selectedGoals.includes(goal.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formData.selectedGoals.includes(goal.id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {formData.selectedGoals.includes(goal.id) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <goal.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-medium">{goal.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Tudo Pronto!</h2>
              <p className="text-muted-foreground">
                Sua conta está configurada. Aqui estão os próximos passos recomendados:
              </p>
            </div>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                <span>Experimente a Calculadora de Impacto</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</div>
                <span>Converse com o Jarvis, nosso assistente IA</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">3</div>
                <span>Explore os casos de estudo</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  step.id === currentStep
                    ? 'bg-primary w-8'
                    : step.id < currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
          </div>

          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
