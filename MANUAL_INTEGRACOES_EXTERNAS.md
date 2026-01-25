# Manual de Integrações Externas - IMPACT7 Platform

**Versão:** 1.0  
**Data:** 25 de Janeiro de 2026  
**Autor:** Manus AI  
**Projeto:** IMPACT7 - Exponential Social Innovation Platform

---

## 📋 Sumário Executivo

Este manual documenta todas as integrações externas disponíveis na plataforma IMPACT7, fornecendo instruções detalhadas para configuração, uso e troubleshooting. O documento é estruturado para facilitar a delegação de tarefas de integração para desenvolvedores externos ou equipes técnicas.

**Integrações Disponíveis:**
- Sistema de Autenticação Local (JWT + bcrypt)
- Sistema RBAC (Role-Based Access Control)
- Banco de Dados MySQL/TiDB
- APIs Externas (LLM, Transcrição de Voz, Geração de Imagens)
- Armazenamento S3
- Mapas (Google Maps via Proxy Manus)
- Notificações Push
- Webhooks
- OAuth 2.0 (para terceiros)
- Gamificação (Pontos e Badges)
- Certificados Blockchain

---

## 1. Sistema de Autenticação Local

### 1.1 Visão Geral

A plataforma IMPACT7 utiliza autenticação **100% local** baseada em JWT (JSON Web Tokens) e bcrypt para hash de senhas. O sistema **NÃO utiliza** OAuth do Manus, garantindo controle total sobre autenticação e autorização.

### 1.2 Arquitetura

**Componentes Principais:**
- `server/_core/local-auth.ts` - Endpoints de registro e login
- `server/_core/cookies.ts` - Configuração de cookies de sessão
- `server/db.ts` - Funções de banco para usuários
- `drizzle/schema.ts` - Tabela `users`

**Fluxo de Autenticação:**

1. **Registro:**
   - Frontend envia `POST /api/auth/register` com `{ email, password, name }`
   - Backend valida dados e verifica se email já existe
   - Senha é hasheada com bcrypt (10 rounds)
   - Usuário é criado no banco com role padrão `user`
   - JWT é gerado e retornado em cookie `httpOnly`

2. **Login:**
   - Frontend envia `POST /api/auth/login` com `{ email, password }`
   - Backend busca usuário por email
   - Senha é comparada com hash armazenado
   - Se válido, JWT é gerado e retornado em cookie
   - Objeto `user` completo é retornado (sem senha)

3. **Logout:**
   - Frontend chama `trpc.auth.logout.useMutation()`
   - Backend limpa cookie de sessão
   - Frontend redireciona para `/login`

### 1.3 Configuração

**Variáveis de Ambiente Necessárias:**

```bash
JWT_SECRET=seu_secret_super_seguro_aqui_minimo_32_caracteres
DATABASE_URL=mysql://user:password@host:port/database
```

**Geração de JWT_SECRET:**

```bash
# Opção 1: OpenSSL
openssl rand -base64 32

# Opção 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 1.4 Endpoints Disponíveis

| Endpoint | Método | Autenticação | Descrição |
|----------|--------|--------------|-----------|
| `/api/auth/register` | POST | Não | Registrar novo usuário |
| `/api/auth/login` | POST | Não | Fazer login |
| `/api/auth/logout` | POST | Sim | Fazer logout |
| `/api/trpc/auth.me` | GET | Sim | Obter usuário logado |

### 1.5 Exemplo de Integração (Frontend)

```typescript
// Registro
const registerMutation = trpc.auth.register.useMutation({
  onSuccess: (data) => {
    console.log('Usuário criado:', data.userId);
    router.push('/dashboard');
  },
  onError: (error) => {
    console.error('Erro no registro:', error.message);
  },
});

registerMutation.mutate({
  email: 'usuario@example.com',
  password: 'SenhaForte123!',
  name: 'Nome do Usuário',
});

// Login
const loginMutation = trpc.auth.login.useMutation({
  onSuccess: (data) => {
    console.log('Login bem-sucedido:', data.user);
    router.push('/dashboard');
  },
});

loginMutation.mutate({
  email: 'usuario@example.com',
  password: 'SenhaForte123!',
});

// Obter usuário logado
const { data: user, isLoading } = trpc.auth.me.useQuery();

if (isLoading) return <div>Carregando...</div>;
if (!user) return <div>Não autenticado</div>;

return <div>Bem-vindo, {user.name}!</div>;
```

### 1.6 Troubleshooting

**Problema:** "JWT_SECRET must have a value"
- **Solução:** Verificar se `JWT_SECRET` está definido em `.env` e tem pelo menos 32 caracteres

**Problema:** "Invalid credentials"
- **Solução:** Verificar se email e senha estão corretos. Senhas são case-sensitive.

**Problema:** Cookie não está sendo enviado
- **Solução:** Verificar configurações de `sameSite` e `secure` em `server/_core/cookies.ts`. Para desenvolvimento local, usar `sameSite: "lax"` e `secure: false`.

---

## 2. Sistema RBAC (Role-Based Access Control)

### 2.1 Visão Geral

O sistema RBAC permite controle granular de acesso baseado em **roles** (papéis) e **permissions** (permissões). Cada usuário pode ter múltiplos roles, e cada role possui um conjunto de permissions.

### 2.2 Arquitetura

**Tabelas do Banco:**
- `roles` - Roles disponíveis (admin, manager, user, guest)
- `permissions` - Permissions disponíveis (content.create, users.read, etc.)
- `rolePermissions` - Associação entre roles e permissions
- `userRoles` - Associação entre usuários e roles

**Funções Principais (`server/rbac.ts`):**
- `checkPermission(userId, permissionCode)` - Verifica se usuário tem permissão
- `checkRole(userId, roleCode)` - Verifica se usuário tem role
- `getUserPermissions(userId)` - Retorna todas as permissions do usuário
- `getUserRoles(userId)` - Retorna todos os roles do usuário
- `assignRole(userId, roleCode)` - Atribui role a usuário
- `removeRole(userId, roleCode)` - Remove role de usuário
- `requirePermission(permissionCode)` - Middleware tRPC para proteger rotas
- `requireRole(roleCode)` - Middleware tRPC para proteger rotas

### 2.3 Roles Padrão

| Role | Code | Level | Descrição |
|------|------|-------|-----------|
| **Admin** | `admin` | 100 | Acesso total ao sistema |
| **Manager** | `manager` | 50 | Gerenciamento de conteúdo e usuários |
| **User** | `user` | 10 | Acesso padrão para usuários registrados |
| **Guest** | `guest` | 0 | Acesso limitado (visualização apenas) |

### 2.4 Permissions Padrão

| Category | Code | Descrição |
|----------|------|-----------|
| **Content** | `content.create` | Criar conteúdo (cases, posts, etc.) |
| | `content.read` | Ler conteúdo |
| | `content.update` | Atualizar conteúdo |
| | `content.delete` | Deletar conteúdo |
| **Users** | `users.create` | Criar usuários |
| | `users.read` | Visualizar usuários |
| | `users.update` | Atualizar usuários |
| | `users.delete` | Deletar usuários |
| **System** | `system.settings` | Acessar configurações do sistema |
| | `system.logs` | Visualizar logs do sistema |
| | `system.backup` | Fazer backup do sistema |
| **Analytics** | `analytics.view` | Visualizar analytics |
| | `analytics.export` | Exportar relatórios |

### 2.5 Exemplo de Integração (Backend)

```typescript
import { requirePermission, requireRole, checkPermission } from './rbac';

// Proteger rota com permission
export const appRouter = router({
  content: router({
    create: protectedProcedure
      .use(requirePermission('content.create'))
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Apenas usuários com permission 'content.create' podem executar
        return await createContent(input);
      }),
  }),

  // Proteger rota com role
  admin: router({
    deleteUser: protectedProcedure
      .use(requireRole('admin'))
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        // Apenas admins podem deletar usuários
        return await deleteUser(input.userId);
      }),
  }),

  // Verificação manual de permission
  customLogic: protectedProcedure
    .mutation(async ({ ctx }) => {
      const hasPermission = await checkPermission(ctx.user.id, 'content.update');
      
      if (hasPermission) {
        // Lógica para usuários com permissão
      } else {
        // Lógica alternativa
      }
    }),
});
```

### 2.6 Exemplo de Integração (Frontend)

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function ContentEditor() {
  const { hasPermission, hasRole, isAdmin } = usePermissions();

  if (!hasPermission('content.create')) {
    return <div>Você não tem permissão para criar conteúdo.</div>;
  }

  return (
    <div>
      <h1>Editor de Conteúdo</h1>
      
      {hasPermission('content.delete') && (
        <button>Deletar</button>
      )}

      {isAdmin() && (
        <button>Configurações Avançadas</button>
      )}
    </div>
  );
}
```

### 2.7 Gerenciamento Visual

A plataforma possui uma interface administrativa em `/admin/users` para:
- Visualizar todos os usuários
- Ver roles e permissions de cada usuário
- Atribuir/remover roles
- Filtrar usuários por role

### 2.8 Troubleshooting

**Problema:** "Permission denied"
- **Solução:** Verificar se usuário tem o role correto atribuído. Usar página `/admin/users` para verificar.

**Problema:** Middleware RBAC não está funcionando
- **Solução:** Verificar se as tabelas RBAC foram populadas com seed. Executar `scripts/seed-rbac.sql`.

---

## 3. Banco de Dados MySQL/TiDB

### 3.1 Visão Geral

A plataforma utiliza **MySQL 8.0+** ou **TiDB Cloud** como banco de dados principal, com **Drizzle ORM** para gerenciamento de schema e queries.

### 3.2 Estrutura do Banco

**Total de Tabelas:** 68 (64 principais + 4 RBAC)

**Categorias:**
- **Autenticação:** users, userAccessTokens, twoFactorAuth
- **RBAC:** roles, permissions, rolePermissions, userRoles
- **Conteúdo:** testimonials, caseStudies, blogPosts, whitepapers, ebooks
- **Calculadora:** calculations, impactCertificates, impactTokens
- **Jarvis (Chat):** jarvisSessions, jarvisMessages, jarvisMemory, jarvisAnalytics
- **Leads:** leads, contacts, newsletterSubscribers, ebookDownloads, whitepaperDownloads
- **Métricas:** siteMetrics, pageViews, dailyMetrics, platformStats
- **Gamificação:** userPoints, badges, userBadges, pointTransactions
- **SET7:** set7Agents, set7Gates, set7Tasklog, set7TokenBudgets, etc.

### 3.3 Configuração

**Variáveis de Ambiente:**

```bash
DATABASE_URL=mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
```

**Exemplo TiDB Cloud:**

```bash
DATABASE_URL=mysql://user.root:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/impact7?ssl={"rejectUnauthorized":true}
```

### 3.4 Gerenciamento de Schema

**Arquivo Principal:** `drizzle/schema.ts`

**Comandos Úteis:**

```bash
# Gerar migrations
pnpm db:generate

# Aplicar migrations
pnpm db:migrate

# Push schema direto (desenvolvimento)
pnpm db:push

# Abrir Drizzle Studio (UI visual)
pnpm db:studio
```

### 3.5 Exemplo de Query (Drizzle ORM)

```typescript
import { getDb } from './server/db';
import { users, testimonials } from './drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

const db = getDb();

// SELECT simples
const allUsers = await db.select().from(users);

// SELECT com WHERE
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'admin@impact7.com'))
  .limit(1);

// INSERT
const result = await db.insert(users).values({
  email: 'novo@example.com',
  passwordHash: hashedPassword,
  name: 'Novo Usuário',
  role: 'user',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const userId = Number(result.insertId);

// UPDATE
await db.update(users)
  .set({ name: 'Nome Atualizado', updatedAt: Date.now() })
  .where(eq(users.id, userId));

// DELETE
await db.delete(users).where(eq(users.id, userId));

// JOIN
const testimonialsWithUsers = await db.select()
  .from(testimonials)
  .leftJoin(users, eq(testimonials.userId, users.id))
  .where(and(
    eq(testimonials.isActive, 1),
    eq(testimonials.isFeatured, 1)
  ))
  .orderBy(desc(testimonials.createdAt))
  .limit(10);
```

### 3.6 Acesso Direto ao Banco

**Via Management UI:**
1. Abrir projeto no Manus
2. Clicar em "Database" no painel direito
3. Usar interface CRUD visual
4. Ver connection string completa em "Settings" (canto inferior esquerdo)

**Via MySQL Client:**

```bash
mysql -h gateway01.us-west-2.prod.aws.tidbcloud.com \
      -P 4000 \
      -u user.root \
      -p \
      --ssl-mode=VERIFY_IDENTITY \
      --ssl-ca=/path/to/ca.pem \
      impact7
```

### 3.7 Troubleshooting

**Problema:** "Unknown column 'X' in 'field list'"
- **Solução:** Schema Drizzle e banco estão dessincronizados. Executar `pnpm db:push` ou adicionar coluna manualmente via `ALTER TABLE`.

**Problema:** "Connection timeout"
- **Solução:** Verificar se IP está na whitelist do TiDB Cloud. Adicionar `0.0.0.0/0` para permitir todos os IPs (apenas desenvolvimento).

**Problema:** "Too many connections"
- **Solução:** Fechar conexões antigas. Verificar se há connection pooling configurado.

---

## 4. APIs Externas (LLM, Transcrição, Imagens)

### 4.1 LLM Integration (Manus Forge API)

**Arquivo:** `server/_core/llm.ts`

**Função Principal:** `invokeLLM(options)`

**Exemplo de Uso:**

```typescript
import { invokeLLM } from './server/_core/llm';

// Chat completion simples
const response = await invokeLLM({
  messages: [
    { role: 'system', content: 'Você é um assistente especializado em impacto social.' },
    { role: 'user', content: 'Como calcular SROI?' },
  ],
});

console.log(response.choices[0].message.content);

// Com imagens (multimodal)
const imageResponse = await invokeLLM({
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Descreva esta imagem' },
        { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
      ],
    },
  ],
});

// Resposta estruturada (JSON)
const structured = await invokeLLM({
  messages: [
    { role: 'user', content: 'Extraia nome e idade: "João tem 25 anos"' },
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'person_info',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
        required: ['name', 'age'],
      },
    },
  },
});

const data = JSON.parse(structured.choices[0].message.content);
console.log(data.name, data.age); // "João", 25
```

**Variáveis de Ambiente:**
- `BUILT_IN_FORGE_API_URL` - URL base da API (pré-configurado)
- `BUILT_IN_FORGE_API_KEY` - Token de autenticação (pré-configurado)

### 4.2 Transcrição de Voz (Whisper API)

**Arquivo:** `server/_core/voiceTranscription.ts`

**Função Principal:** `transcribeAudio(options)`

**Exemplo de Uso:**

```typescript
import { transcribeAudio } from './server/_core/voiceTranscription';

const result = await transcribeAudio({
  audioUrl: 'https://storage.example.com/audio/recording.mp3',
  language: 'pt', // Opcional: melhora precisão
  prompt: 'Transcrição de reunião sobre impacto social', // Opcional: contexto
});

console.log('Transcrição:', result.text);
console.log('Idioma detectado:', result.language);
console.log('Segmentos:', result.segments); // Timestamps detalhados
```

**Formatos Suportados:** webm, mp3, wav, ogg, m4a  
**Limite de Tamanho:** 16MB

### 4.3 Geração de Imagens

**Arquivo:** `server/_core/imageGeneration.ts`

**Função Principal:** `generateImage(options)`

**Exemplo de Uso:**

```typescript
import { generateImage } from './server/_core/imageGeneration';

// Gerar nova imagem
const { url: imageUrl } = await generateImage({
  prompt: 'Uma paisagem serena com montanhas ao pôr do sol',
});

console.log('Imagem gerada:', imageUrl);

// Editar imagem existente
const { url: editedUrl } = await generateImage({
  prompt: 'Adicionar um arco-íris no céu',
  originalImages: [{
    url: 'https://example.com/original.jpg',
    mimeType: 'image/jpeg',
  }],
});
```

**Tempo de Geração:** 5-20 segundos  
**Resolução:** 1024x1024 (padrão)

---

## 5. Armazenamento S3

### 5.1 Visão Geral

Todos os arquivos (imagens, documentos, PDFs) devem ser armazenados no **S3** (não no filesystem local). O bucket é público, então URLs retornadas funcionam sem assinatura adicional.

### 5.2 Funções Disponíveis

**Arquivo:** `server/storage.ts`

```typescript
import { storagePut, storageGet } from './server/storage';

// Upload de arquivo
const { url, key } = await storagePut(
  'users/123/profile.jpg', // Caminho relativo
  fileBuffer, // Buffer | Uint8Array | string
  'image/jpeg' // Content-Type
);

console.log('URL pública:', url);
console.log('Key:', key);

// Obter URL assinada (opcional, para acesso temporário)
const { url: signedUrl } = await storageGet(
  'users/123/profile.jpg',
  3600 // Expira em 1 hora
);
```

### 5.3 Boas Práticas

1. **Sempre salvar metadados no banco:**
   ```typescript
   await db.insert(files).values({
     userId: 123,
     fileKey: key,
     url: url,
     filename: 'profile.jpg',
     mimeType: 'image/jpeg',
     size: fileBuffer.length,
     createdAt: Date.now(),
   });
   ```

2. **Usar sufixos aleatórios para prevenir enumeração:**
   ```typescript
   const randomSuffix = () => Math.random().toString(36).substring(7);
   const fileKey = `users/${userId}/avatar-${randomSuffix()}.jpg`;
   ```

3. **Organizar por categoria:**
   ```
   users/{userId}/avatar.jpg
   cases/{caseId}/images/photo1.jpg
   whitepapers/{id}/document.pdf
   ```

### 5.4 Variáveis de Ambiente

Pré-configuradas automaticamente pelo Manus:
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

---

## 6. Mapas (Google Maps via Proxy)

### 6.1 Visão Geral

A plataforma possui acesso **COMPLETO** ao Google Maps JavaScript API via proxy Manus. **NÃO é necessário** solicitar API key do usuário.

### 6.2 Componente Frontend

**Arquivo:** `client/src/components/Map.tsx`

**Exemplo de Uso:**

```typescript
import MapView from '@/components/Map';

function LocationPicker() {
  const handleMapReady = (map: google.maps.Map, google: typeof window.google) => {
    // Adicionar marcador
    new google.maps.Marker({
      position: { lat: -23.5505, lng: -46.6333 }, // São Paulo
      map: map,
      title: 'São Paulo',
    });

    // Usar Places API
    const service = new google.maps.places.PlacesService(map);
    service.findPlaceFromQuery({
      query: 'Museu do Ipiranga',
      fields: ['name', 'geometry'],
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        console.log('Lugar encontrado:', results[0]);
      }
    });

    // Usar Directions API
    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
      origin: 'São Paulo, SP',
      destination: 'Rio de Janeiro, RJ',
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') {
        console.log('Rota:', result);
      }
    });
  };

  return (
    <MapView
      onMapReady={handleMapReady}
      center={{ lat: -23.5505, lng: -46.6333 }}
      zoom={12}
    />
  );
}
```

### 6.3 Recursos Disponíveis

**TODOS** os recursos do Google Maps JavaScript API estão disponíveis:
- Markers, Polylines, Polygons
- Places API (busca, autocomplete, detalhes)
- Directions API (rotas)
- Geocoding API (endereço ↔ coordenadas)
- Drawing Tools (desenhar formas)
- Heatmaps
- Street View
- Todos os layers (Traffic, Transit, Bicycling)

### 6.4 Backend API (Opcional)

Para operações server-side (bulk geocoding, caching, etc.):

```typescript
import { makeRequest } from './server/_core/map';

// Geocoding
const response = await makeRequest('/maps/api/geocode/json', {
  address: 'Avenida Paulista, 1578 - São Paulo',
});

console.log('Coordenadas:', response.results[0].geometry.location);

// Directions
const directions = await makeRequest('/maps/api/directions/json', {
  origin: 'São Paulo, SP',
  destination: 'Rio de Janeiro, RJ',
  mode: 'driving',
});
```

---

## 7. Notificações Push

### 7.1 Visão Geral

Sistema de notificações em tempo real usando **Server-Sent Events (SSE)** para entregar notificações instantâneas ao frontend.

### 7.2 Arquitetura

**Backend:**
- `server/services/notifications/push-notification-service.ts` - Lógica de notificações
- `server/services/notifications/notification-persistence-service.ts` - Persistência no banco

**Frontend:**
- Hook `useNotifications()` para receber notificações em tempo real
- Componente `NotificationCenter` para exibir lista de notificações

### 7.3 Exemplo de Uso (Backend)

```typescript
import { sendNotificationToUser } from './services/notifications/push-notification-service';

// Enviar notificação para usuário específico
await sendNotificationToUser(userId, {
  type: 'info',
  title: 'Novo case aprovado',
  message: 'Seu case study foi aprovado e publicado!',
  actionUrl: '/cases/123',
});

// Tipos disponíveis: 'info', 'success', 'warning', 'error'
```

### 7.3 Exemplo de Uso (Frontend)

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <button>
        🔔 {unreadCount > 0 && <span>{unreadCount}</span>}
      </button>

      <ul>
        {notifications.map(notif => (
          <li key={notif.id} onClick={() => markAsRead(notif.id)}>
            <strong>{notif.title}</strong>
            <p>{notif.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 7.4 Notificar Proprietário do Projeto

Para enviar notificações ao proprietário do projeto Manus:

```typescript
import { notifyOwner } from './server/_core/notification';

const success = await notifyOwner({
  title: 'Nova submissão de case',
  content: 'Um novo case study foi submetido e aguarda aprovação.',
});

if (success) {
  console.log('Proprietário notificado com sucesso');
}
```

---

## 8. Webhooks

### 8.1 Visão Geral

Sistema de webhooks permite que a plataforma envie eventos HTTP para URLs externas quando determinadas ações ocorrem.

### 8.2 Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| `user.created` | Novo usuário registrado |
| `user.updated` | Usuário atualizado |
| `case.submitted` | Novo case submetido |
| `case.approved` | Case aprovado |
| `calculation.completed` | Cálculo de impacto concluído |
| `certificate.issued` | Certificado emitido |

### 8.3 Exemplo de Uso

```typescript
import { createWebhook, testWebhook } from './services/webhooks/webhook-service';

// Criar webhook
const webhook = await createWebhook({
  userId: 123,
  url: 'https://example.com/webhook',
  events: ['case.submitted', 'case.approved'],
  secret: 'webhook_secret_key', // Para validar assinatura
  isActive: true,
});

// Testar webhook
const result = await testWebhook(webhook.id);
console.log('Webhook testado:', result.success);
```

### 8.4 Validação de Assinatura (Receptor)

```typescript
import crypto from 'crypto';

function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

// Endpoint receptor
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  if (!validateWebhookSignature(payload, signature, 'webhook_secret_key')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Processar evento
  console.log('Evento recebido:', req.body.event, req.body.data);
  res.json({ success: true });
});
```

---

## 9. OAuth 2.0 (Para Terceiros)

### 9.1 Visão Geral

A plataforma pode atuar como **provedor OAuth 2.0**, permitindo que aplicações terceiras acessem dados dos usuários com consentimento explícito.

### 9.2 Fluxo de Autorização

1. **Registrar aplicação OAuth:**
   ```typescript
   const client = await createOAuthClient({
     userId: ownerId,
     name: 'Minha App Externa',
     redirectUris: ['https://myapp.com/callback'],
     scopes: ['read:profile', 'read:cases'],
   });
   ```

2. **Redirecionar usuário para autorização:**
   ```
   https://impact7.com/oauth/authorize?
     client_id={client_id}&
     redirect_uri={redirect_uri}&
     response_type=code&
     scope=read:profile read:cases&
     state={random_state}
   ```

3. **Trocar código por tokens:**
   ```typescript
   const tokens = await exchangeCodeForTokens({
     code: authorizationCode,
     clientId: client.clientId,
     clientSecret: client.clientSecret,
     redirectUri: 'https://myapp.com/callback',
   });

   console.log('Access Token:', tokens.accessToken);
   console.log('Refresh Token:', tokens.refreshToken);
   ```

4. **Usar access token:**
   ```bash
   curl -H "Authorization: Bearer {access_token}" \
        https://impact7.com/api/v1/me
   ```

### 9.3 Scopes Disponíveis

| Scope | Descrição |
|-------|-----------|
| `read:profile` | Ler perfil do usuário |
| `write:profile` | Atualizar perfil do usuário |
| `read:cases` | Ler cases do usuário |
| `write:cases` | Criar/atualizar cases |
| `read:calculations` | Ler cálculos de impacto |
| `admin` | Acesso administrativo completo |

---

## 10. Gamificação (Pontos e Badges)

### 10.1 Visão Geral

Sistema de gamificação para engajar usuários através de pontos, badges e leaderboards.

### 10.2 Sistema de Pontos

**Ações que Geram Pontos:**

| Ação | Pontos |
|------|--------|
| Registro | 100 |
| Login diário | 10 |
| Submeter case | 50 |
| Case aprovado | 200 |
| Completar cálculo | 30 |
| Download whitepaper | 20 |
| Compartilhar conteúdo | 15 |

**Exemplo de Uso:**

```typescript
import { addPoints, getUserPoints } from './services/gamification/gamification-service';

// Adicionar pontos
await addPoints(userId, 50, 'case_submitted', 'Submeteu novo case study');

// Obter pontos do usuário
const points = await getUserPoints(userId);
console.log('Total de pontos:', points.totalPoints);
console.log('Streak atual:', points.currentStreak, 'dias');
```

### 10.3 Sistema de Badges

**Badges Disponíveis:**

| Badge | Código | Requisito |
|-------|--------|-----------|
| 🌟 Novato | `newcomer` | Registrar-se |
| 🔥 Streak Master | `streak_master` | 7 dias consecutivos |
| 📊 Analista | `analyst` | 10 cálculos completados |
| 📝 Escritor | `writer` | 5 cases submetidos |
| 🏆 Expert | `expert` | 1000 pontos totais |
| 👑 Líder | `leader` | Top 10 no leaderboard |

**Exemplo de Uso:**

```typescript
import { getUserBadges, getAllBadges } from './services/gamification/gamification-service';

// Obter badges do usuário
const userBadges = await getUserBadges(userId);
console.log('Badges conquistados:', userBadges.length);

// Listar todos os badges disponíveis
const allBadges = await getAllBadges();
```

### 10.4 Leaderboard

```typescript
import { getLeaderboard } from './services/gamification/gamification-service';

// Top 10 usuários
const leaderboard = await getLeaderboard(10);

leaderboard.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.name} - ${entry.totalPoints} pontos`);
});
```

---

## 11. Certificados Blockchain

### 11.1 Visão Geral

Sistema de certificados de impacto verificáveis em blockchain, com tokens NFT associados.

### 11.2 Emissão de Certificado

```typescript
import { issueCertificate } from './services/blockchain-certificate-service';

const certificate = await issueCertificate({
  userId: 123,
  calculationId: 456,
  organizationName: 'Fundação Abrinq',
  projectName: 'Educação Infantil 2025',
  impactMetrics: {
    beneficiaries: 1000,
    sroi: 3.5,
    co2Reduced: 500,
  },
  validUntil: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 ano
});

console.log('Certificado emitido:', certificate.certificateId);
console.log('QR Code:', certificate.qrCodeUrl);
console.log('URL de verificação:', certificate.verificationUrl);
```

### 11.3 Verificação de Certificado

```typescript
import { verifyCertificate } from './services/blockchain-certificate-service';

const verification = await verifyCertificate(certificateId);

if (verification.isValid) {
  console.log('Certificado válido!');
  console.log('Emitido para:', verification.organizationName);
  console.log('Projeto:', verification.projectName);
  console.log('Métricas:', verification.impactMetrics);
} else {
  console.log('Certificado inválido ou revogado');
}
```

### 11.4 Tokens NFT

```typescript
import { mintToken, getUserTokens } from './services/blockchain-certificate-service';

// Mintar token NFT
const token = await mintToken({
  certificateId: certificate.id,
  userId: 123,
  metadata: {
    name: 'Certificado de Impacto #456',
    description: 'Projeto Educação Infantil 2025',
    image: 'https://storage.example.com/certificates/456.png',
  },
});

console.log('Token mintado:', token.tokenId);
console.log('Blockchain TX:', token.transactionHash);

// Listar tokens do usuário
const userTokens = await getUserTokens(userId);
```

---

## 12. Checklist de Integração

### 12.1 Pré-requisitos

- [ ] Node.js 22+ instalado
- [ ] pnpm instalado
- [ ] Acesso ao banco MySQL/TiDB
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas (`pnpm install`)

### 12.2 Autenticação Local

- [ ] `JWT_SECRET` configurado (mínimo 32 caracteres)
- [ ] Tabela `users` criada no banco
- [ ] Endpoints `/api/auth/register` e `/api/auth/login` testados
- [ ] Cookie de sessão funcionando
- [ ] Logout funcionando

### 12.3 Sistema RBAC

- [ ] Tabelas RBAC criadas (`roles`, `permissions`, `rolePermissions`, `userRoles`)
- [ ] Seed de roles e permissions executado
- [ ] Role `admin` atribuído a pelo menos 1 usuário
- [ ] Middleware `requirePermission` testado
- [ ] Página `/admin/users` acessível

### 12.4 Banco de Dados

- [ ] Conexão com banco estabelecida
- [ ] Schema Drizzle sincronizado (`pnpm db:push`)
- [ ] Todas as 68 tabelas criadas
- [ ] Queries básicas testadas (SELECT, INSERT, UPDATE, DELETE)
- [ ] Drizzle Studio acessível (`pnpm db:studio`)

### 12.5 APIs Externas

- [ ] LLM: `invokeLLM()` testado com chat simples
- [ ] Transcrição: `transcribeAudio()` testado com arquivo de áudio
- [ ] Imagens: `generateImage()` testado com prompt
- [ ] Todas as APIs retornando respostas válidas

### 12.6 Armazenamento S3

- [ ] `storagePut()` testado com upload de imagem
- [ ] URL pública retornada e acessível
- [ ] Metadados salvos no banco
- [ ] Organização de pastas definida

### 12.7 Mapas

- [ ] Componente `MapView` renderizando mapa
- [ ] Callback `onMapReady` executando
- [ ] Markers, Polylines funcionando
- [ ] Places API testada (se necessário)

### 12.8 Notificações

- [ ] SSE endpoint `/api/notifications/stream` funcionando
- [ ] Frontend recebendo notificações em tempo real
- [ ] `notifyOwner()` enviando notificações ao proprietário
- [ ] Notificações sendo persistidas no banco

### 12.9 Webhooks

- [ ] Webhook criado e testado
- [ ] Endpoint receptor validando assinatura
- [ ] Eventos sendo disparados corretamente
- [ ] Logs de entregas acessíveis

### 12.10 OAuth 2.0

- [ ] Cliente OAuth criado
- [ ] Fluxo de autorização testado
- [ ] Tokens sendo gerados corretamente
- [ ] Access token funcionando em requisições

### 12.11 Gamificação

- [ ] Badges padrão criados
- [ ] Pontos sendo atribuídos corretamente
- [ ] Leaderboard exibindo top usuários
- [ ] Badges sendo desbloqueados

### 12.12 Certificados Blockchain

- [ ] Certificado emitido com sucesso
- [ ] QR Code gerado
- [ ] Verificação de certificado funcionando
- [ ] Token NFT mintado (se aplicável)

---

## 13. Troubleshooting Geral

### 13.1 Erros Comuns

**"Module not found"**
- Executar `pnpm install`
- Verificar se path está correto
- Limpar cache: `rm -rf node_modules && pnpm install`

**"Port 3000 already in use"**
- Matar processo: `lsof -ti:3000 | xargs kill -9`
- Ou usar porta diferente: `PORT=3001 pnpm dev`

**"Database connection failed"**
- Verificar `DATABASE_URL` em `.env`
- Testar conexão: `mysql -h host -u user -p`
- Verificar firewall/whitelist

**"TypeScript errors"**
- Executar `pnpm tsc --noEmit` para ver todos os erros
- Verificar se tipos estão corretos
- Atualizar dependências: `pnpm update`

### 13.2 Logs e Debugging

**Logs do Servidor:**
```bash
tail -f .manus-logs/devserver.log
```

**Logs do Browser:**
```bash
tail -f .manus-logs/browserConsole.log
```

**Logs de Rede:**
```bash
tail -f .manus-logs/networkRequests.log
```

**Habilitar Debug:**
```bash
DEBUG=* pnpm dev
```

### 13.3 Performance

**Queries Lentas:**
- Adicionar índices nas colunas mais consultadas
- Usar `EXPLAIN` para analisar queries
- Implementar caching (Redis)

**Build Lento:**
- Verificar tamanho dos chunks: `pnpm build --analyze`
- Usar dynamic imports para code splitting
- Otimizar imagens (WebP, compressão)

---

## 14. Contato e Suporte

**Documentação Oficial:** https://docs.manus.im  
**Suporte Técnico:** https://help.manus.im  
**Comunidade:** Discord (link no site oficial)

**Desenvolvedor Principal:** Manus AI  
**Versão do Manual:** 1.0  
**Última Atualização:** 25 de Janeiro de 2026

---

## 15. Apêndices

### 15.1 Glossário

- **RBAC:** Role-Based Access Control (Controle de Acesso Baseado em Papéis)
- **JWT:** JSON Web Token (Token de autenticação)
- **SSE:** Server-Sent Events (Eventos enviados pelo servidor)
- **SROI:** Social Return on Investment (Retorno Social sobre Investimento)
- **NFT:** Non-Fungible Token (Token não fungível)
- **tRPC:** TypeScript Remote Procedure Call (Chamada de procedimento remoto tipada)

### 15.2 Referências

Este manual foi criado com base na implementação atual da plataforma IMPACT7 e nas melhores práticas de desenvolvimento web moderno.

---

**Fim do Manual de Integrações Externas**
