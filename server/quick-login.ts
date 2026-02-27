import { Router } from 'express';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { customLogin } from './auth-custom';

const router = Router();

// Endpoint de login rápido (temporário para desenvolvimento)
router.post('/api/quick-login', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Buscar o admin
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    console.log('[Quick-Login] Admin found:', admin.email);

    // Fazer login usando sistema customizado
    const loginResult = await customLogin(admin.email ?? 'admin@impact7.com', 'admin123', res);
    
    if (!loginResult.success) {
      return res.status(500).json({
        success: false,
        error: loginResult.error || 'Login failed',
      });
    }

    res.json({
      success: true,
      user: loginResult.user,
    });
  } catch (error: any) {
    console.error('[Quick-Login] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
