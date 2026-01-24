import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaPrivacidade() {
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
          <h1>Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: 15 de Janeiro de 2026</p>

          <p>
            A IMPACT7 ("nós", "nosso" ou "Plataforma") está comprometida com a proteção da privacidade dos usuários. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>

          <h2>1. Dados que Coletamos</h2>
          
          <h3>1.1 Dados fornecidos por você</h3>
          <ul>
            <li><strong>Dados de cadastro:</strong> nome, email, organização, cargo</li>
            <li><strong>Dados de perfil:</strong> foto, biografia, preferências</li>
            <li><strong>Dados de projetos:</strong> informações sobre cases de impacto social</li>
            <li><strong>Dados de pagamento:</strong> processados pelo Stripe (não armazenamos dados de cartão)</li>
          </ul>

          <h3>1.2 Dados coletados automaticamente</h3>
          <ul>
            <li><strong>Dados de uso:</strong> páginas visitadas, funcionalidades utilizadas, tempo de sessão</li>
            <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional</li>
            <li><strong>Cookies:</strong> identificadores de sessão e preferências</li>
          </ul>

          <h2>2. Como Usamos seus Dados</h2>
          <p>Utilizamos seus dados pessoais para:</p>
          <ul>
            <li>Fornecer e manter os serviços da Plataforma</li>
            <li>Processar pagamentos e gerenciar assinaturas</li>
            <li>Emitir certificações e tokens de impacto</li>
            <li>Personalizar sua experiência na Plataforma</li>
            <li>Enviar comunicações sobre o serviço</li>
            <li>Melhorar nossos produtos e serviços</li>
            <li>Cumprir obrigações legais e regulatórias</li>
          </ul>

          <h2>3. Base Legal para Tratamento</h2>
          <p>O tratamento de seus dados pessoais é realizado com base nas seguintes hipóteses legais da LGPD:</p>
          <table className="w-full">
            <thead>
              <tr>
                <th>Finalidade</th>
                <th>Base Legal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Execução do contrato de serviço</td>
                <td>Art. 7º, V - Execução de contrato</td>
              </tr>
              <tr>
                <td>Envio de comunicações de marketing</td>
                <td>Art. 7º, I - Consentimento</td>
              </tr>
              <tr>
                <td>Cumprimento de obrigações legais</td>
                <td>Art. 7º, II - Obrigação legal</td>
              </tr>
              <tr>
                <td>Melhoria dos serviços</td>
                <td>Art. 7º, IX - Legítimo interesse</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Compartilhamento de Dados</h2>
          <p>Podemos compartilhar seus dados com:</p>
          <ul>
            <li><strong>Processadores de pagamento:</strong> Stripe, para processar transações</li>
            <li><strong>Provedores de infraestrutura:</strong> serviços de hospedagem e banco de dados</li>
            <li><strong>Parceiros de certificação:</strong> quando você solicita certificação</li>
            <li><strong>Autoridades:</strong> quando exigido por lei ou ordem judicial</li>
          </ul>
          <p>Não vendemos seus dados pessoais a terceiros.</p>

          <h2>5. Transferência Internacional</h2>
          <p>
            Seus dados podem ser processados em servidores localizados fora do Brasil. Nesses casos, garantimos que os países ou organizações destinatários ofereçam nível adequado de proteção de dados ou que existam salvaguardas apropriadas, conforme exigido pela LGPD.
          </p>

          <h2>6. Retenção de Dados</h2>
          <p>Mantemos seus dados pessoais pelo tempo necessário para:</p>
          <ul>
            <li>Fornecer os serviços contratados</li>
            <li>Cumprir obrigações legais (ex: 5 anos para dados fiscais)</li>
            <li>Exercer direitos em processos judiciais</li>
          </ul>
          <p>Após o encerramento da conta, seus dados serão anonimizados ou excluídos em até 30 dias, exceto quando houver obrigação legal de retenção.</p>

          <h2>7. Seus Direitos</h2>
          <p>Conforme a LGPD, você tem direito a:</p>
          <ul>
            <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
            <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
            <li><strong>Anonimização ou exclusão:</strong> solicitar anonimização ou exclusão de dados desnecessários</li>
            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
            <li><strong>Revogação do consentimento:</strong> retirar consentimento a qualquer momento</li>
            <li><strong>Oposição:</strong> opor-se ao tratamento em certas circunstâncias</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato através do email: privacidade@impact7.com.br</p>

          <h2>8. Segurança dos Dados</h2>
          <p>Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo:</p>
          <ul>
            <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
            <li>Controle de acesso baseado em funções (RBAC)</li>
            <li>Autenticação segura (OAuth 2.0)</li>
            <li>Monitoramento e auditoria de acessos</li>
            <li>Backups regulares</li>
          </ul>

          <h2>9. Cookies</h2>
          <p>Utilizamos cookies para:</p>
          <ul>
            <li><strong>Cookies essenciais:</strong> necessários para o funcionamento da Plataforma</li>
            <li><strong>Cookies de preferências:</strong> lembrar suas configurações</li>
            <li><strong>Cookies analíticos:</strong> entender como você usa a Plataforma</li>
          </ul>
          <p>Você pode gerenciar cookies através das configurações do seu navegador.</p>

          <h2>10. Menores de Idade</h2>
          <p>
            A Plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para excluí-los.
          </p>

          <h2>11. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política periodicamente. Alterações significativas serão comunicadas por email ou através da Plataforma. Recomendamos revisar esta página regularmente.
          </p>

          <h2>12. Encarregado de Dados (DPO)</h2>
          <p>
            Para questões relacionadas à proteção de dados, entre em contato com nosso Encarregado de Dados:
          </p>
          <ul>
            <li><strong>Email:</strong> dpo@impact7.com.br</li>
            <li><strong>Endereço:</strong> [Endereço da empresa]</li>
          </ul>

          <h2>13. Autoridade Nacional de Proteção de Dados</h2>
          <p>
            Se você acredita que seus direitos não foram atendidos, pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD) através do site: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Esta Política de Privacidade foi elaborada em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e demais normas aplicáveis.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
