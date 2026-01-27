/**
 * Serviço de Gamificação do Jarvis
 * Sistema de pontos, badges e níveis para engajamento de usuários
 */

import { getDb } from "../../db";
import { userPoints, badges, userBadges, pointTransactions } from "../../../drizzle/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

// Definição dos badges padrão
export const DEFAULT_BADGES = [
  {
    slug: "first_question",
    name: "Primeira Pergunta",
    description: "Fez sua primeira pergunta ao Jarvis",
    icon: "🎯",
    color: "#22c55e",
    requirement: "interactions",
    requiredValue: 1,
    pointsReward: 50,
    rarity: "common" as const,
  },
  {
    slug: "curious_mind",
    name: "Mente Curiosa",
    description: "Fez 10 perguntas ao Jarvis",
    icon: "🧠",
    color: "#3b82f6",
    requirement: "interactions",
    requiredValue: 10,
    pointsReward: 100,
    rarity: "common" as const,
  },
  {
    slug: "knowledge_seeker",
    name: "Buscador de Conhecimento",
    description: "Fez 50 perguntas ao Jarvis",
    icon: "📚",
    color: "#8b5cf6",
    requirement: "interactions",
    requiredValue: 50,
    pointsReward: 250,
    rarity: "uncommon" as const,
  },
  {
    slug: "impact_expert",
    name: "Especialista em Impacto",
    description: "Fez 100 perguntas ao Jarvis",
    icon: "🏆",
    color: "#f59e0b",
    requirement: "interactions",
    requiredValue: 100,
    pointsReward: 500,
    rarity: "rare" as const,
  },
  {
    slug: "impact_master",
    name: "Mestre do Impacto",
    description: "Fez 500 perguntas ao Jarvis",
    icon: "👑",
    color: "#ef4444",
    requirement: "interactions",
    requiredValue: 500,
    pointsReward: 1000,
    rarity: "epic" as const,
  },
  {
    slug: "streak_3",
    name: "Consistente",
    description: "Usou o Jarvis por 3 dias seguidos",
    icon: "🔥",
    color: "#f97316",
    requirement: "streak",
    requiredValue: 3,
    pointsReward: 150,
    rarity: "common" as const,
  },
  {
    slug: "streak_7",
    name: "Dedicado",
    description: "Usou o Jarvis por 7 dias seguidos",
    icon: "⚡",
    color: "#eab308",
    requirement: "streak",
    requiredValue: 7,
    pointsReward: 300,
    rarity: "uncommon" as const,
  },
  {
    slug: "streak_30",
    name: "Comprometido",
    description: "Usou o Jarvis por 30 dias seguidos",
    icon: "💎",
    color: "#06b6d4",
    requirement: "streak",
    requiredValue: 30,
    pointsReward: 1000,
    rarity: "rare" as const,
  },
  {
    slug: "level_5",
    name: "Aprendiz",
    description: "Alcançou o nível 5",
    icon: "⭐",
    color: "#84cc16",
    requirement: "level",
    requiredValue: 5,
    pointsReward: 200,
    rarity: "common" as const,
  },
  {
    slug: "level_10",
    name: "Praticante",
    description: "Alcançou o nível 10",
    icon: "🌟",
    color: "#14b8a6",
    requirement: "level",
    requiredValue: 10,
    pointsReward: 500,
    rarity: "uncommon" as const,
  },
  {
    slug: "level_25",
    name: "Veterano",
    description: "Alcançou o nível 25",
    icon: "✨",
    color: "#ec4899",
    requirement: "level",
    requiredValue: 25,
    pointsReward: 1500,
    rarity: "rare" as const,
  },
  {
    slug: "level_50",
    name: "Lenda",
    description: "Alcançou o nível 50",
    icon: "🌈",
    color: "#6366f1",
    requirement: "level",
    requiredValue: 50,
    pointsReward: 5000,
    rarity: "legendary" as const,
  },
];

// Pontos por ação
export const POINTS_CONFIG = {
  jarvis_question: 10,
  jarvis_feedback_positive: 5,
  jarvis_feedback_negative: 2,
  calculator_use: 15,
  case_favorite: 5,
  case_download: 10,
  daily_login: 20,
  streak_bonus: 10, // per day in streak
};

// Níveis e XP necessário
export function calculateLevel(points: number): number {
  // Fórmula: level = floor(sqrt(points / 100)) + 1
  return Math.floor(Math.sqrt(points / 100)) + 1;
}

export function pointsForLevel(level: number): number {
  // Inverso da fórmula: points = (level - 1)^2 * 100
  return Math.pow(level - 1, 2) * 100;
}

export function pointsToNextLevel(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelPoints = pointsForLevel(currentLevel + 1);
  return nextLevelPoints - currentPoints;
}

// Inicializar badges padrão no banco
export async function initializeDefaultBadges(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  for (const badge of DEFAULT_BADGES) {
    const existing = await db.select().from(badges).where(eq(badges.slug, badge.slug));
    if (existing.length === 0) {
      await db.insert(badges).values(badge);
    }
  }
}

// Obter ou criar pontos do usuário
export async function getUserPoints(userId: number): Promise<typeof userPoints.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
  
  if (existing.length === 0) {
    await db.insert(userPoints).values({ userId, points: 0, level: 1 ,
          createdAt: Date.now(),
        });
    const created = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
    return created[0] || null;
  }
  
  return existing[0];
}

// Adicionar pontos ao usuário
export async function addPoints(
  userId: number, 
  points: number, 
  reason: string,
  metadata?: Record<string, unknown>
): Promise<{ newPoints: number; newLevel: number; leveledUp: boolean; newBadges: typeof badges.$inferSelect[] }> {
  const db = await getDb();
  if (!db) return { newPoints: 0, newLevel: 1, leveledUp: false, newBadges: [] };
  
  // Obter pontos atuais
  let userPointsRecord = await getUserPoints(userId);
  if (!userPointsRecord) {
    return { newPoints: 0, newLevel: 1, leveledUp: false, newBadges: [] };
  }
  
  const oldLevel = userPointsRecord.level;
  const newPoints = userPointsRecord.points + points;
  const newLevel = calculateLevel(newPoints);
  const leveledUp = newLevel > oldLevel;
  
  // Atualizar pontos
  await db.update(userPoints)
    .set({ 
      points: newPoints, 
      level: newLevel,
      totalInteractions: sql`${userPoints.totalInteractions} + 1`,
      lastInteractionAt: Date.now(),
    })
    .where(eq(userPoints.userId, userId));
  
  // Registrar transação
  await db.insert(pointTransactions).values({
    userId,
    points,
    reason,
    metadata: metadata ? JSON.stringify(metadata) : null,
  
          createdAt: Date.now(),
        });
  
  // Verificar e conceder badges
  const newBadges = await checkAndAwardBadges(userId, newPoints, newLevel);
  
  return { newPoints, newLevel, leveledUp, newBadges };
}

// Atualizar streak do usuário
export async function updateStreak(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const userPointsRecord = await getUserPoints(userId);
  if (!userPointsRecord) return 0;
  
  const now = Date.now();
  const lastInteraction = userPointsRecord.lastInteractionAt;
  
  let newStreak = userPointsRecord.streak;
  
  if (lastInteraction) {
    const hoursSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastInteraction >= 24 && hoursSinceLastInteraction < 48) {
      // Novo dia, incrementar streak
      newStreak += 1;
      
      // Bonus de streak
      const streakBonus = POINTS_CONFIG.streak_bonus * newStreak;
      await addPoints(userId, streakBonus, "streak_bonus", { streak: newStreak });
    } else if (hoursSinceLastInteraction >= 48) {
      // Perdeu o streak
      newStreak = 1;
    }
    // Se < 24h, mantém o streak atual
  } else {
    newStreak = 1;
  }
  
  await db.update(userPoints)
    .set({ streak: newStreak })
    .where(eq(userPoints.userId, userId));
  
  return newStreak;
}

// Verificar e conceder badges
export async function checkAndAwardBadges(
  userId: number, 
  points: number, 
  level: number
): Promise<typeof badges.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  
  const userPointsRecord = await getUserPoints(userId);
  if (!userPointsRecord) return [];
  
  // Obter todos os badges
  const allBadges = await db.select().from(badges);
  
  // Obter badges já conquistados
  const earnedBadges = await db.select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badgeId));
  
  const newBadges: typeof badges.$inferSelect[] = [];
  
  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;
    
    let earned = false;
    
    switch (badge.requirement) {
      case "interactions":
        earned = userPointsRecord.totalInteractions >= badge.requiredValue;
        break;
      case "streak":
        earned = userPointsRecord.streak >= badge.requiredValue;
        break;
      case "level":
        earned = level >= badge.requiredValue;
        break;
      case "points":
        earned = points >= badge.requiredValue;
        break;
    }
    
    if (earned) {
      await db.insert(userBadges).values({
        userId,
        badgeId: badge.id,
      
          createdAt: Date.now(),
        });
      
      // Dar pontos de recompensa
      await db.insert(pointTransactions).values({
        userId,
        points: badge.pointsReward,
        reason: `badge_earned:${badge.slug}`,
      });
      
      // Atualizar pontos totais
      await db.update(userPoints)
        .set({ points: sql`${userPoints.points} + ${badge.pointsReward}` })
        .where(eq(userPoints.userId, userId));
      
      newBadges.push(badge);
    }
  }
  
  return newBadges;
}

// Obter badges do usuário
export async function getUserBadges(userId: number): Promise<typeof badges.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  
  const earned = await db.select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));
  
  if (earned.length === 0) return [];
  
  const badgeIds = earned.map(e => e.badgeId);
  const allBadges = await db.select().from(badges);
  
  return allBadges.filter(b => badgeIds.includes(b.id));
}

// Obter todos os badges disponíveis
export async function getAllBadges(): Promise<typeof badges.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(badges);
}

// Obter leaderboard
export async function getLeaderboard(limit: number = 10): Promise<Array<{
  rank: number;
  userId: number;
  points: number;
  level: number;
  totalInteractions: number;
  streak: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  const leaders = await db.select()
    .from(userPoints)
    .orderBy(desc(userPoints.points))
    .limit(limit);
  
  return leaders.map((leader, index) => ({
    rank: index + 1,
    userId: leader.userId,
    points: leader.points,
    level: leader.level,
    totalInteractions: leader.totalInteractions,
    streak: leader.streak,
  }));
}

// Obter estatísticas do usuário
export async function getUserStats(userId: number): Promise<{
  points: number;
  level: number;
  totalInteractions: number;
  streak: number;
  rank: number;
  pointsToNextLevel: number;
  progressPercent: number;
  badges: typeof badges.$inferSelect[];
  recentTransactions: typeof pointTransactions.$inferSelect[];
}> {
  const db = await getDb();
  if (!db) {
    return {
      points: 0,
      level: 1,
      totalInteractions: 0,
      streak: 0,
      rank: 0,
      pointsToNextLevel: 100,
      progressPercent: 0,
      badges: [],
      recentTransactions: [],
    };
  }
  
  const userPointsRecord = await getUserPoints(userId);
  if (!userPointsRecord) {
    return {
      points: 0,
      level: 1,
      totalInteractions: 0,
      streak: 0,
      rank: 0,
      pointsToNextLevel: 100,
      progressPercent: 0,
      badges: [],
      recentTransactions: [],
    };
  }
  
  // Calcular rank
  const higherRanked = await db.select({ count: sql<number>`count(*)` })
    .from(userPoints)
    .where(gte(userPoints.points, userPointsRecord.points));
  const rank = Number(higherRanked[0]?.count || 1);
  
  // Obter badges
  const userBadgesList = await getUserBadges(userId);
  
  // Obter transações recentes
  const recentTransactions = await db.select()
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId))
    .orderBy(desc(pointTransactions.createdAt))
    .limit(10);
  
  // Calcular progresso para próximo nível
  const currentLevelPoints = pointsForLevel(userPointsRecord.level);
  const nextLevelPoints = pointsForLevel(userPointsRecord.level + 1);
  const progressPoints = userPointsRecord.points - currentLevelPoints;
  const levelRange = nextLevelPoints - currentLevelPoints;
  const progressPercent = Math.min(100, Math.round((progressPoints / levelRange) * 100));
  
  return {
    points: userPointsRecord.points,
    level: userPointsRecord.level,
    totalInteractions: userPointsRecord.totalInteractions,
    streak: userPointsRecord.streak,
    rank,
    pointsToNextLevel: pointsToNextLevel(userPointsRecord.points),
    progressPercent,
    badges: userBadgesList,
    recentTransactions,
  };
}
