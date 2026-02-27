/**
 * Servico de Autenticacao Local
 * Permite login com email/senha alem do OAuth
 */

import bcrypt from 'bcryptjs';
import { getDb } from '../../db';
import { users } from '../../../drizzle/schema';
import { eq, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const SALT_ROUNDS = 12;

export const localAuthService = {
  /**
   * Hash de senha com bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Verificar senha
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Criar usuario local com email/senha
   */
  async createLocalUser(data: {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'manager' | 'admin';
  }) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Verificar se email ja existe
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Email ja cadastrado');
    }

    // Hash da senha
    const passwordHash = await this.hashPassword(data.password);

    // Inserir usuario
    await db.insert(users).values({
      email: data.email,
      name: data.name,
      passwordHash,
      loginMethod: 'local',
      role: data.role || 'user',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      lastSignedIn: Date.now(),
    });

    // Buscar o usuario recem criado
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    return {
      id: newUser[0]?.id || 0,
      email: data.email,
      name: data.name,
      role: data.role || 'user',
    };
  },

  /**
   * Login com email/senha
   */
  async login(email: string, password: string) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Buscar usuario por email
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      throw new Error('Email ou senha incorretos');
    }

    const user = userResults[0];

    // Verificar se tem senha (usuario local)
    if (!user.passwordHash) {
      throw new Error('Este usuario usa login social. Use o botao de login com Manus.');
    }

    // Verificar senha
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Email ou senha incorretos');
    }

    // Atualizar ultimo login
    const db2 = await getDb();
    if (!db2) throw new Error('Database not available');
    await db2
      .update(users)
      .set({ lastSignedIn: Date.now() })
      .where(eq(users.id, user.id));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },

  /**
   * Alterar senha
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Buscar usuario
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResults.length === 0) {
      throw new Error('Usuario nao encontrado');
    }

    const user = userResults[0];

    // Verificar senha atual
    if (!user.passwordHash) {
      throw new Error('Usuario nao tem senha local');
    }

    const isValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const newPasswordHash = await this.hashPassword(newPassword);

    // Atualizar senha
    const db2 = await getDb();
    if (!db2) throw new Error('Database not available');
    await db2
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, userId));

    return { success: true };
  },

  /**
   * Definir senha para usuario existente (admin)
   */
  async setPassword(userId: number, newPassword: string) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const passwordHash = await this.hashPassword(newPassword);

    await db
      .update(users)
      .set({ 
        passwordHash,
        loginMethod: 'local',
      })
      .where(eq(users.id, userId));

    return { success: true };
  },

  /**
   * Buscar usuario por email
   */
  async getUserByEmail(email: string) {
    const db = await getDb();
    if (!db) return null;

    const results = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  },
};
