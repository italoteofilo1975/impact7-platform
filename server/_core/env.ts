// Em producao, um JWT_SECRET vazio permitiria assinar e verificar tokens com segredo trivial,
// abrindo forjamento de sessao. Falha rapido no boot em vez de rodar silenciosamente inseguro.
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET obrigatorio em producao. Configure a variavel de ambiente antes de iniciar o servidor.",
  );
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Provedor de LLM, nossa stack. Compativel com OpenAI (Anthropic via camada compat,
  // OpenAI, ou qualquer gateway). Sem chave, o adaptador entra em modo mock rotulado.
  llmApiUrl:
    process.env.LLM_API_URL ??
    process.env.BUILT_IN_FORGE_API_URL ??
    "https://api.anthropic.com/v1",
  llmApiKey:
    process.env.LLM_API_KEY ??
    process.env.ANTHROPIC_API_KEY ??
    process.env.BUILT_IN_FORGE_API_KEY ??
    "",
  llmModel: process.env.LLM_MODEL ?? "claude-sonnet-4-5-20250929",

  // Segundo provedor de LLM, Groq (a empresa de inferencia rapida sobre modelos abertos,
  // Llama/Mixtral/etc, nao confundir com Grok da xAI, sao duas empresas diferentes com nomes
  // parecidos), para os agentes conversacionais de aliados e parceiros (subprojeto pedido pelo
  // dono). Endpoint compativel com OpenAI, mesmo formato do adaptador principal. Sem chave, o
  // mesmo modo mock rotulado do provedor Anthropic entra em acao.
  groqApiUrl: process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",

  // Compat retro, ainda lido por integracoes antigas (dataApi, imagem).
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // Storage, Supabase.
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "impact7",

  // Notificacoes, Resend opcional. Sem chave, modo log.
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "no-reply@impact7.local",

  appUrl: process.env.VITE_APP_URL ?? "http://localhost:3000",
};
