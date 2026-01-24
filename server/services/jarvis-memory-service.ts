/**
 * Jarvis Long-Term Memory Service
 * 
 * Provides persistent memory capabilities for the Jarvis AI assistant,
 * allowing it to remember user preferences, facts, and context across sessions.
 */

import { getDb } from '../db';
import { jarvisMemory, type JarvisMemory, type InsertJarvisMemory } from '../../drizzle/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

export type MemoryType = 'preference' | 'fact' | 'context' | 'goal' | 'project' | 'interaction';

export interface MemoryEntry {
  key: string;
  value: string;
  type: MemoryType;
  importance?: number;
}

export interface MemorySearchResult {
  memories: JarvisMemory[];
  totalCount: number;
}

/**
 * Save a memory entry for a user
 */
export async function saveMemory(
  userId: number,
  entry: MemoryEntry
): Promise<JarvisMemory> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if memory with same key exists
  const existing = await db
    .select()
    .from(jarvisMemory)
    .where(
      and(
        eq(jarvisMemory.userId, userId),
        eq(jarvisMemory.key, entry.key),
        eq(jarvisMemory.isActive, true)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing memory
    await db
      .update(jarvisMemory)
      .set({
        value: entry.value,
        importance: entry.importance ?? existing[0].importance,
        lastAccessed: new Date(),
        accessCount: sql`${jarvisMemory.accessCount} + 1`,
      })
      .where(eq(jarvisMemory.id, existing[0].id));

    return { ...existing[0], value: entry.value };
  }

  // Create new memory
  const result = await db.insert(jarvisMemory).values({
    userId,
    memoryType: entry.type,
    key: entry.key,
    value: entry.value,
    importance: entry.importance ?? 5,
  });

  const newMemory = await db
    .select()
    .from(jarvisMemory)
    .where(eq(jarvisMemory.id, Number(result[0].insertId)))
    .limit(1);

  return newMemory[0];
}

/**
 * Retrieve memories for a user by type
 */
export async function getMemoriesByType(
  userId: number,
  type: MemoryType,
  limit: number = 20
): Promise<JarvisMemory[]> {
  const db = await getDb();
  if (!db) return [];
  
  const memories = await db
    .select()
    .from(jarvisMemory)
    .where(
      and(
        eq(jarvisMemory.userId, userId),
        eq(jarvisMemory.memoryType, type),
        eq(jarvisMemory.isActive, true)
      )
    )
    .orderBy(desc(jarvisMemory.importance), desc(jarvisMemory.lastAccessed))
    .limit(limit);

  // Update access count for retrieved memories
  if (memories.length > 0) {
    const ids = memories.map(m => m.id);
    await db
      .update(jarvisMemory)
      .set({
        lastAccessed: new Date(),
        accessCount: sql`${jarvisMemory.accessCount} + 1`,
      })
      .where(sql`${jarvisMemory.id} IN (${ids.join(',')})`);
  }

  return memories;
}

/**
 * Get a specific memory by key
 */
export async function getMemoryByKey(
  userId: number,
  key: string
): Promise<JarvisMemory | null> {
  const db = await getDb();
  if (!db) return null;
  
  const memories = await db
    .select()
    .from(jarvisMemory)
    .where(
      and(
        eq(jarvisMemory.userId, userId),
        eq(jarvisMemory.key, key),
        eq(jarvisMemory.isActive, true)
      )
    )
    .limit(1);

  if (memories.length === 0) return null;

  // Update access count
  await db
    .update(jarvisMemory)
    .set({
      lastAccessed: new Date(),
      accessCount: sql`${jarvisMemory.accessCount} + 1`,
    })
    .where(eq(jarvisMemory.id, memories[0].id));

  return memories[0];
}

/**
 * Search memories by keyword
 */
export async function searchMemories(
  userId: number,
  query: string,
  limit: number = 10
): Promise<MemorySearchResult> {
  const db = await getDb();
  if (!db) return { memories: [], totalCount: 0 };
  
  const searchPattern = `%${query}%`;
  
  const memories = await db
    .select()
    .from(jarvisMemory)
    .where(
      and(
        eq(jarvisMemory.userId, userId),
        eq(jarvisMemory.isActive, true),
        sql`(${jarvisMemory.key} LIKE ${searchPattern} OR ${jarvisMemory.value} LIKE ${searchPattern})`
      )
    )
    .orderBy(desc(jarvisMemory.importance), desc(jarvisMemory.lastAccessed))
    .limit(limit);

  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(jarvisMemory)
    .where(
      and(
        eq(jarvisMemory.userId, userId),
        eq(jarvisMemory.isActive, true),
        sql`(${jarvisMemory.key} LIKE ${searchPattern} OR ${jarvisMemory.value} LIKE ${searchPattern})`
      )
    );

  return {
    memories,
    totalCount: countResult[0]?.count ?? 0,
  };
}

/**
 * Get all active memories for a user (for context building)
 */
export async function getAllUserMemories(
  userId: number,
  limit: number = 50
): Promise<JarvisMemory[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(jarvisMemory)
    .where(
      and(
        eq(jarvisMemory.userId, userId),
        eq(jarvisMemory.isActive, true)
      )
    )
    .orderBy(desc(jarvisMemory.importance), desc(jarvisMemory.accessCount))
    .limit(limit);
}

/**
 * Build context string from user memories for LLM
 */
export async function buildMemoryContext(userId: number): Promise<string> {
  const memories = await getAllUserMemories(userId, 30);
  
  if (memories.length === 0) {
    return '';
  }

  const groupedMemories: Record<MemoryType, JarvisMemory[]> = {
    preference: [],
    fact: [],
    context: [],
    goal: [],
    project: [],
    interaction: [],
  };

  memories.forEach((m: JarvisMemory) => {
    groupedMemories[m.memoryType as MemoryType].push(m);
  });

  const contextParts: string[] = [];

  if (groupedMemories.preference.length > 0) {
    contextParts.push('**Preferências do Usuário:**');
    groupedMemories.preference.forEach(m => {
      contextParts.push(`- ${m.key}: ${m.value}`);
    });
  }

  if (groupedMemories.fact.length > 0) {
    contextParts.push('\n**Fatos Conhecidos:**');
    groupedMemories.fact.forEach(m => {
      contextParts.push(`- ${m.key}: ${m.value}`);
    });
  }

  if (groupedMemories.goal.length > 0) {
    contextParts.push('\n**Objetivos do Usuário:**');
    groupedMemories.goal.forEach(m => {
      contextParts.push(`- ${m.key}: ${m.value}`);
    });
  }

  if (groupedMemories.project.length > 0) {
    contextParts.push('\n**Projetos em Andamento:**');
    groupedMemories.project.forEach(m => {
      contextParts.push(`- ${m.key}: ${m.value}`);
    });
  }

  if (groupedMemories.context.length > 0) {
    contextParts.push('\n**Contexto Adicional:**');
    groupedMemories.context.forEach(m => {
      contextParts.push(`- ${m.key}: ${m.value}`);
    });
  }

  return contextParts.join('\n');
}

/**
 * Delete a memory (soft delete)
 */
export async function deleteMemory(
  userId: number,
  memoryId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .update(jarvisMemory)
    .set({ isActive: false })
    .where(
      and(
        eq(jarvisMemory.id, memoryId),
        eq(jarvisMemory.userId, userId)
      )
    );

  return true;
}

/**
 * Clear all memories for a user
 */
export async function clearAllMemories(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .update(jarvisMemory)
    .set({ isActive: false })
    .where(eq(jarvisMemory.userId, userId));

  return 1; // Return count of affected rows
}

/**
 * Extract and save memories from conversation
 */
export async function extractAndSaveMemories(
  userId: number,
  userMessage: string,
  assistantResponse: string
): Promise<MemoryEntry[]> {
  const extractedMemories: MemoryEntry[] = [];

  // Simple pattern matching for memory extraction
  // In production, this could use LLM for more sophisticated extraction

  // Preference patterns
  const preferencePatterns = [
    /(?:prefiro|gosto de|minha preferência é)\s+(.+)/i,
    /(?:sempre uso|costumo usar)\s+(.+)/i,
  ];

  // Goal patterns
  const goalPatterns = [
    /(?:meu objetivo é|quero|pretendo)\s+(.+)/i,
    /(?:estou trabalhando para|buscando)\s+(.+)/i,
  ];

  // Project patterns
  const projectPatterns = [
    /(?:meu projeto|estou desenvolvendo|trabalhando em)\s+(.+)/i,
    /(?:projeto chamado|projeto de)\s+(.+)/i,
  ];

  // Check for preferences
  for (const pattern of preferencePatterns) {
    const match = userMessage.match(pattern);
    if (match) {
      const memory: MemoryEntry = {
        key: `preferencia_${Date.now()}`,
        value: match[1].trim(),
        type: 'preference',
        importance: 6,
      };
      extractedMemories.push(memory);
      await saveMemory(userId, memory);
    }
  }

  // Check for goals
  for (const pattern of goalPatterns) {
    const match = userMessage.match(pattern);
    if (match) {
      const memory: MemoryEntry = {
        key: `objetivo_${Date.now()}`,
        value: match[1].trim(),
        type: 'goal',
        importance: 7,
      };
      extractedMemories.push(memory);
      await saveMemory(userId, memory);
    }
  }

  // Check for projects
  for (const pattern of projectPatterns) {
    const match = userMessage.match(pattern);
    if (match) {
      const memory: MemoryEntry = {
        key: `projeto_${Date.now()}`,
        value: match[1].trim(),
        type: 'project',
        importance: 8,
      };
      extractedMemories.push(memory);
      await saveMemory(userId, memory);
    }
  }

  return extractedMemories;
}

export default {
  saveMemory,
  getMemoriesByType,
  getMemoryByKey,
  searchMemories,
  getAllUserMemories,
  buildMemoryContext,
  deleteMemory,
  clearAllMemories,
  extractAndSaveMemories,
};
