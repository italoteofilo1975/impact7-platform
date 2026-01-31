# IMPACT7 Platform - API Documentation

**Version:** 5.3.0  
**Last Updated:** January 2026  
**Base URL:** `https://your-domain.com/api/trpc`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#authentication-apis)
   - [Lead Management APIs](#lead-management-apis)
   - [Content Management APIs](#content-management-apis)
   - [Gamification APIs](#gamification-apis)
   - [Analytics APIs](#analytics-apis)
   - [Jarvis AI APIs](#jarvis-ai-apis)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Overview

The IMPACT7 Platform API is built on **tRPC 11**, providing end-to-end type-safe APIs with automatic TypeScript inference. All endpoints use **JSON** for request/response bodies and support **SuperJSON** for advanced data types (Date, Map, Set, etc.).

**Key Features:**
- ✅ End-to-end type safety
- ✅ Automatic request validation (Zod schemas)
- ✅ Built-in error handling
- ✅ JWT-based authentication
- ✅ Real-time subscriptions (SSE)
- ✅ Batch request support

---

## Authentication

All protected endpoints require a valid JWT token sent via **HttpOnly cookie** (`auth_token`).

### Authentication Flow

1. **Register:** `POST /api/auth/register`
2. **Login:** `POST /api/auth/login` → Returns JWT in cookie
3. **Access Protected Endpoints:** Cookie automatically sent with requests
4. **Logout:** `POST /api/auth/logout` → Clears cookie

### Token Structure

```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "user",
  "iat": 1704067200,
  "exp": 1735689600
}
```

**Token Expiry:** 1 year (configurable)

---

## API Endpoints

### Authentication APIs

#### `auth.register`

Register a new user account.

**Type:** `mutation`  
**Auth Required:** No

**Request:**
```typescript
{
  email: string;        // Valid email format
  password: string;     // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  name: string;         // User's full name
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    role: "user" | "admin";
    createdAt: Date;
  };
}
```

**Example:**
```typescript
const result = await client.auth.register.mutate({
  email: "john@example.com",
  password: "SecurePass123",
  name: "John Doe"
});
```

---

#### `auth.login`

Authenticate user and receive JWT token.

**Type:** `mutation`  
**Auth Required:** No

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: number;
    email: string;
    name: string;
    role: "user" | "admin";
  };
}
```

**Example:**
```typescript
const result = await client.auth.login.mutate({
  email: "john@example.com",
  password: "SecurePass123"
});
```

---

#### `auth.me`

Get current authenticated user.

**Type:** `query`  
**Auth Required:** Yes

**Request:** None

**Response:**
```typescript
{
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: Date;
}
```

**Example:**
```typescript
const user = await client.auth.me.query();
```

---

#### `auth.logout`

Logout current user and clear session.

**Type:** `mutation`  
**Auth Required:** Yes

**Request:** None

**Response:**
```typescript
{
  success: boolean;
}
```

**Example:**
```typescript
await client.auth.logout.mutate();
```

---

#### `auth.requestPasswordReset`

Request password reset email.

**Type:** `mutation`  
**Auth Required:** No

**Request:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
const result = await client.auth.requestPasswordReset.mutate({
  email: "john@example.com"
});
```

---

### Lead Management APIs

#### `leads.create`

Create a new lead from form submission.

**Type:** `mutation`  
**Auth Required:** No

**Request:**
```typescript
{
  name: string;
  email: string;
  company?: string;
  phone?: string;
  source: "contact_form" | "whitepaper_download" | "case_submission" | "newsletter";
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  id: number;
  name: string;
  email: string;
  company: string | null;
  source: string;
  createdAt: Date;
}
```

**Example:**
```typescript
const lead = await client.leads.create.mutate({
  name: "Jane Smith",
  email: "jane@company.com",
  company: "Acme Corp",
  source: "whitepaper_download",
  metadata: { whitepaperId: 5 }
});
```

---

#### `leads.list`

List all leads with pagination and filtering.

**Type:** `query`  
**Auth Required:** Yes (Admin only)

**Request:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  source?: string;      // Filter by source
  startDate?: string;   // ISO date string
  endDate?: string;     // ISO date string
}
```

**Response:**
```typescript
{
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Example:**
```typescript
const leads = await client.leads.list.query({
  page: 1,
  limit: 50,
  source: "whitepaper_download"
});
```

---

#### `leads.exportCSV`

Export leads to CSV format.

**Type:** `query`  
**Auth Required:** Yes (Admin only)

**Request:**
```typescript
{
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
  source?: string;      // Optional filter
}
```

**Response:**
```typescript
string  // CSV formatted data
```

**Example:**
```typescript
const csv = await client.leads.exportCSV.query({
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z"
});
```

---

### Content Management APIs

#### `blog.create`

Create a new blog post.

**Type:** `mutation`  
**Auth Required:** Yes (Admin only)

**Request:**
```typescript
{
  title: string;
  slug: string;           // URL-friendly slug
  content: string;        // Markdown supported
  excerpt: string;
  authorId: number;
  status: "draft" | "published" | "archived";
  tags?: string[];
  featuredImage?: string; // URL to image
}
```

**Response:**
```typescript
{
  id: number;
  title: string;
  slug: string;
  status: string;
  createdAt: Date;
}
```

**Example:**
```typescript
const post = await client.blog.create.mutate({
  title: "How to Scale Social Impact",
  slug: "how-to-scale-social-impact",
  content: "# Introduction\n\nScaling social impact requires...",
  excerpt: "Learn strategies for scaling your social impact initiatives.",
  authorId: 1,
  status: "published",
  tags: ["impact", "scaling", "strategy"]
});
```

---

#### `blog.list`

List blog posts with filtering.

**Type:** `query`  
**Auth Required:** No

**Request:**
```typescript
{
  status?: "draft" | "published" | "archived";
  page?: number;
  limit?: number;
  tag?: string;
}
```

**Response:**
```typescript
{
  items: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}
```

**Example:**
```typescript
const posts = await client.blog.list.query({
  status: "published",
  page: 1,
  limit: 10
});
```

---

### Gamification APIs

#### `gamification.awardBadge`

Award a badge to a user.

**Type:** `mutation`  
**Auth Required:** Yes

**Request:**
```typescript
{
  userId: number;
  badgeId: number;
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  userBadge: {
    id: number;
    userId: number;
    badgeId: number;
    awardedAt: Date;
  };
}
```

**Example:**
```typescript
const result = await client.gamification.awardBadge.mutate({
  userId: 123,
  badgeId: 5,
  reason: "Completed 10 case studies"
});
```

---

#### `gamification.getUserPoints`

Get user's total points and breakdown.

**Type:** `query`  
**Auth Required:** Yes

**Request:**
```typescript
{
  userId: number;
}
```

**Response:**
```typescript
{
  total: number;
  breakdown: {
    activityType: string;
    points: number;
  }[];
}
```

**Example:**
```typescript
const points = await client.gamification.getUserPoints.query({
  userId: 123
});
```

---

### Jarvis AI APIs

#### `jarvis.chat`

Send a message to Jarvis AI assistant.

**Type:** `mutation`  
**Auth Required:** Yes

**Request:**
```typescript
{
  message: string;
  sessionId?: string;   // Optional, for conversation continuity
  context?: Record<string, any>;
}
```

**Response:**
```typescript
{
  response: string;
  sessionId: string;
  timestamp: Date;
}
```

**Example:**
```typescript
const result = await client.jarvis.chat.mutate({
  message: "What is the impact of our latest campaign?",
  sessionId: "session-123"
});
```

---

## Error Handling

All API errors follow this structure:

```typescript
{
  error: {
    code: string;           // TRPC error code
    message: string;        // Human-readable error message
    data?: {
      zodError?: any;       // Validation errors (if applicable)
      code?: string;        // Custom error code
    };
  };
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid request parameters |
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_SERVER_ERROR` | Server error |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |

**Example Error Response:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "data": {
      "code": "AUTH_REQUIRED"
    }
  }
}
```

---

## Rate Limiting

**Default Limits:**
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 300 requests/minute
- Admin endpoints: 1000 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

---

## Examples

### Complete Authentication Flow

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';
import superjson from 'superjson';

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'https://your-domain.com/api/trpc',
      credentials: 'include', // Important for cookies
    }),
  ],
});

// 1. Register
const registerResult = await client.auth.register.mutate({
  email: "user@example.com",
  password: "SecurePass123",
  name: "New User"
});

// 2. Login
const loginResult = await client.auth.login.mutate({
  email: "user@example.com",
  password: "SecurePass123"
});

// 3. Get current user
const currentUser = await client.auth.me.query();

// 4. Access protected endpoint
const leads = await client.leads.list.query({ page: 1, limit: 20 });

// 5. Logout
await client.auth.logout.mutate();
```

### Batch Requests

```typescript
// Execute multiple queries in a single HTTP request
const [user, leads, posts] = await Promise.all([
  client.auth.me.query(),
  client.leads.list.query({ page: 1 }),
  client.blog.list.query({ status: "published" })
]);
```

### Error Handling

```typescript
try {
  const result = await client.auth.login.mutate({
    email: "invalid@example.com",
    password: "wrong"
  });
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    console.error('Invalid credentials');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

---

## Support

For API support, contact: **support@impact7.com**

**Documentation Version:** 5.3.0  
**API Version:** 1.0.0  
**Last Updated:** January 31, 2026
