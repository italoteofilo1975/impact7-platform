import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: 15 de Janeiro de 2026</p>

          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a Plataforma IMPACT7 ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar a Plataforma.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            A Plataforma IMPACT7 é um serviço de software como serviço (SaaS) que oferece ferramentas para mensuração de impacto social, incluindo:
          </p>
          <ul>
            <li>Calculadora de Retorno Social sobre Investimento (SROI)</li>
            <li>Gestão de cases de impacto</li>
            <li>Sistema de certificação digital</li>
            <li>Tokens de reconhecimento de impacto</li>
            <li>Assistente inteligente (Jarvis)</li>
            <li>Relatórios e análises</li>
          </ul>

          <h2>3. Cadastro e Conta</h2>
          <p>
            Para utilizar a Plataforma, você deve criar uma conta fornecendo informações verdadeiras, completas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
          </p>

          <h2>4. Planos e Pagamentos</h2>
          <h3>4.1 Planos Disponíveis</h3>
          <ul>
            <li><strong>Free:</strong> Acesso básico com funcionalidades limitadas</li>
            <li><strong>Pro:</strong> Acesso completo para organizações</li>
            <li><strong>Enterprise:</strong> Acesso ilimitado com recursos avançados</li>
          </ul>

          <h3>4.2 Cobrança</h3>
          <p>
            Os planos pagos são cobrados mensalmente ou anualmente, conforme escolha do usuário. O pagamento é processado de forma segura através de nosso parceiro de pagamentos (Stripe).
          </p>

          <h3>4.3 Cancelamento</h3>
          <p>
            Você pode cancelar sua assinatura a qualquer momento. O acesso às funcionalidades do plano será mantido até o final do período já pago. Não há reembolso proporcional para cancelamentos antes do término do período.
          </p>

          <h2>5. Uso Aceitável</h2>
          <p>Ao utilizar a Plataforma, você concorda em:</p>
          <ul>
            <li>Não violar leis ou regulamentos aplicáveis</li>
            <li>Não infringir direitos de propriedade intelectual de terceiros</li>
            <li>Não transmitir conteúdo ilegal, ofensivo ou prejudicial</li>
            <li>Não tentar acessar áreas restritas do sistema</li>
            <li>Não utilizar a Plataforma para fins fraudulentos</li>
            <li>Não sobrecarregar ou interferir no funcionamento da Plataforma</li>
          </ul>

          <h2>6. Propriedade Intelectual</h2>
          <p>
            A Plataforma IMPACT7, incluindo seu código, design, logotipos, textos e demais elementos, é protegida por direitos de propriedade intelectual. O Método IMPACT7 é uma metodologia proprietária. O uso da Plataforma não confere ao usuário qualquer direito de propriedade sobre estes elementos.
          </p>

          <h2>7. Dados e Privacidade</h2>
          <p>
            O tratamento de dados pessoais é regido por nossa <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>, que é parte integrante destes Termos de Uso.
          </p>

          <h2>8. Certificações e Tokens</h2>
          <p>
            As certificações emitidas pela Plataforma representam o cumprimento de critérios metodológicos específicos e não constituem garantia de resultados futuros. Os Tokens de Impacto são instrumentos de reconhecimento interno da Plataforma e não possuem valor monetário ou cambial.
          </p>

          <h2>9. Limitação de Responsabilidade</h2>
          <p>
            A Plataforma é fornecida "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por:
          </p>
          <ul>
            <li>Decisões tomadas com base em informações da Plataforma</li>
            <li>Interrupções temporárias do serviço</li>
            <li>Perda de dados decorrente de uso inadequado</li>
            <li>Danos indiretos, incidentais ou consequenciais</li>
          </ul>

          <h2>10. Modificações dos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por email ou através da Plataforma. O uso continuado após as modificações constitui aceitação dos novos termos.
          </p>

          <h2>11. Rescisão</h2>
          <p>
            Podemos suspender ou encerrar seu acesso à Plataforma em caso de violação destes Termos, sem prejuízo de outras medidas cabíveis.
          </p>

          <h2>12. Disposições Gerais</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será submetida ao foro da comarca de São Paulo/SP, com exclusão de qualquer outro.
          </p>

          <h2>13. Contato</h2>
          <p>
            Para dúvidas sobre estes Termos de Uso, entre em contato através do email: contato@impact7.com.br
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Ao utilizar a Plataforma IMPACT7, você declara ter lido, compreendido e concordado com estes Termos de Uso.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
