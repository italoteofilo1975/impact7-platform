/**
 * Login Tradicional com Email/Senha
 */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { createCustomJWT } from "./auth-custom";

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email e senha são obrigatórios",
      });
    }

    const db = await getDb();

    // Buscar usuário por email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas",
      });
    }

    // Verificar senha
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: "Usuário não possui senha configurada",
      });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Credenciais inválidas",
      });
    }

    // Criar JWT
    const token = await createCustomJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Setar cookie
    res.cookie("app_session_id", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
    });

    // Retornar sucesso
    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Login] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
}

export async function handleLogout(req: Request, res: Response) {
  try {
    // Limpar cookie
    res.clearCookie("app_session_id");

    return res.json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("[Logout] Error:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
}
