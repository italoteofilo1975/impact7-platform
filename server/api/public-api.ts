/**
 * API REST Pública IMPACT7
 * Endpoints públicos para integração com sistemas externos
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getDb } from '../db';
import { caseSubmissions, leads, socialProofMetrics } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { checkAPIKeyLimit, generateRateLimitHeaders } from '../security/api/rate-limiter';
import { createAuditLog } from '../security/audit/logger';

const router = Router();

// API Key validation middleware
const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Include X-API-Key header.',
    });
  }
  
  // Check rate limit
  const rateLimitResult = checkAPIKeyLimit(apiKey);
  const headers = generateRateLimitHeaders(rateLimitResult);
  Object.entries(headers).forEach(([name, value]) => {
    res.setHeader(name, value);
  });
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter,
    });
  }
  
  // Log API access
  createAuditLog({
    eventType: 'api.request',
    action: `API request to ${req.method} ${req.path}`,
    ip: req.ip,
    details: { apiKey: apiKey.substring(0, 8) + '...' },
    success: true,
  });
  
  next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

/**
 * @openapi
 * /api/v1/cases:
 *   get:
 *     summary: List all published case studies
 *     tags: [Cases]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of cases to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of cases to skip
 *     responses:
 *       200:
 *         description: List of case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CaseStudy'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/cases', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const cases = await db
      .select()
      .from(caseSubmissions)
      .where(eq(caseSubmissions.status, 'approved'))
      .orderBy(desc(caseSubmissions.createdAt))
      .limit(limit)
      .offset(offset);
    
    res.json({
      success: true,
      data: cases.map((c: any) => ({
        id: c.id,
        title: c.projectTitle,
        organization: c.organizationName,
        sector: c.sector,
        location: c.location,
        challenge: c.challenge,
        solution: c.solution,
        results: c.results,
        investment: c.investment,
        beneficiaries: c.beneficiaries,
        duration: c.duration,
        createdAt: c.createdAt,
      })),
      pagination: {
        limit,
        offset,
        hasMore: cases.length === limit,
      },
    });
  } catch (error) {
    console.error('[PublicAPI] Error fetching cases:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch case studies',
    });
  }
});

/**
 * @openapi
 * /api/v1/cases/{id}:
 *   get:
 *     summary: Get a specific case study by ID
 *     tags: [Cases]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Case study ID
 *     responses:
 *       200:
 *         description: Case study details
 *       404:
 *         description: Case study not found
 */
router.get('/cases/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const [caseStudy] = await db
      .select()
      .from(caseSubmissions)
      .where(eq(caseSubmissions.id, parseInt(id)))
      .limit(1);
    
    if (!caseStudy || caseStudy.status !== 'approved') {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Case study not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        id: caseStudy.id,
        title: caseStudy.projectTitle,
        organization: caseStudy.organizationName,
        sector: caseStudy.sector,
        location: caseStudy.location,
        challenge: caseStudy.challenge,
        solution: caseStudy.solution,
        results: caseStudy.results,
        investment: caseStudy.investment,
        beneficiaries: caseStudy.beneficiaries,
        duration: caseStudy.duration,
        description: caseStudy.description,
        metrics: caseStudy.metrics,
        createdAt: caseStudy.createdAt,
      },
    });
  } catch (error) {
    console.error('[PublicAPI] Error fetching case:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch case study',
    });
  }
});

/**
 * @openapi
 * /api/v1/calculator:
 *   post:
 *     summary: Calculate social impact using IMPACT7 formula
 *     tags: [Calculator]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalculatorInput'
 *     responses:
 *       200:
 *         description: Calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalculatorResult'
 */
const calculatorInputSchema = z.object({
  engagement: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  connection: z.number().min(0).max(100),
  commitment: z.number().min(0).max(100),
  collaboration: z.number().min(0).max(100),
  creativity: z.number().min(0).max(100),
  continuity: z.number().min(0).max(100),
  resistance: z.number().min(1).max(100),
  investment: z.number().min(0).optional(),
});

router.post('/calculator', async (req: Request, res: Response) => {
  try {
    const input = calculatorInputSchema.parse(req.body);
    
    // Calculate C^7 (product of all 7 Cs)
    const c7 = (
      (input.clarity / 100) *
      (input.connection / 100) *
      (input.commitment / 100) *
      (input.collaboration / 100) *
      (input.creativity / 100) *
      (input.continuity / 100) *
      (input.engagement / 100)
    );
    
    // Calculate Impact Score: I = (E × C^7) / R
    const impactScore = ((input.engagement / 100) * c7 * 1000) / (input.resistance / 100);
    
    // Calculate S-ROI if investment provided
    let sroi = null;
    if (input.investment && input.investment > 0) {
      const socialValue = impactScore * 1000; // Simplified social value calculation
      sroi = socialValue / input.investment;
    }
    
    // Determine impact level
    let level: string;
    if (impactScore >= 80) level = 'exceptional';
    else if (impactScore >= 60) level = 'high';
    else if (impactScore >= 40) level = 'moderate';
    else if (impactScore >= 20) level = 'developing';
    else level = 'initial';
    
    res.json({
      success: true,
      data: {
        impactScore: Math.round(impactScore * 100) / 100,
        level,
        c7Value: Math.round(c7 * 10000) / 10000,
        sroi: sroi ? Math.round(sroi * 100) / 100 : null,
        recommendations: generateRecommendations(input),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input parameters',
        details: error.issues,
      });
    }
    
    console.error('[PublicAPI] Calculator error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Calculation failed',
    });
  }
});

function generateRecommendations(input: z.infer<typeof calculatorInputSchema>): string[] {
  const recommendations: string[] = [];
  
  if (input.clarity < 50) {
    recommendations.push('Improve clarity of objectives and communication');
  }
  if (input.connection < 50) {
    recommendations.push('Strengthen stakeholder connections and relationships');
  }
  if (input.commitment < 50) {
    recommendations.push('Increase organizational commitment to impact goals');
  }
  if (input.collaboration < 50) {
    recommendations.push('Enhance cross-functional collaboration');
  }
  if (input.creativity < 50) {
    recommendations.push('Foster innovation and creative problem-solving');
  }
  if (input.continuity < 50) {
    recommendations.push('Establish sustainable processes for long-term impact');
  }
  if (input.resistance > 70) {
    recommendations.push('Address resistance factors through change management');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maintain current practices and focus on scaling impact');
  }
  
  return recommendations;
}

/**
 * @openapi
 * /api/v1/leads:
 *   post:
 *     summary: Submit a new lead
 *     tags: [Leads]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeadInput'
 *     responses:
 *       201:
 *         description: Lead created successfully
 */
const leadInputSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  organization: z.string().optional(),
  phone: z.string().optional(),
  source: z.enum(['contact_form', 'whitepaper_download', 'ebook', 'scheduling', 'calculator']).optional(),
  message: z.string().optional(),
});

router.post('/leads', async (req: Request, res: Response) => {
  try {
    const input = leadInputSchema.parse(req.body);
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const result = await db.insert(leads).values({
      name: input.name,
      email: input.email,
      organization: input.organization,
      phone: input.phone,
      source: input.source || 'contact_form',
      message: input.message,
    
          createdAt: Date.now(),
        }).$returningId();
    
    const lead = result[0];
    
    res.status(201).json({
      success: true,
      data: {
        id: lead.id,
        message: 'Lead submitted successfully',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input parameters',
        details: error.issues,
      });
    }
    
    console.error('[PublicAPI] Lead creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create lead',
    });
  }
});

/**
 * @openapi
 * /api/v1/metrics:
 *   get:
 *     summary: Get public social proof metrics
 *     tags: [Metrics]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Public metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const metrics = await db
      .select()
      .from(socialProofMetrics)
      .where(eq(socialProofMetrics.isActive, true))
      .orderBy(socialProofMetrics.displayOrder);
    
    res.json({
      success: true,
      data: metrics.map((m: any) => ({
        label: m.label,
        value: m.value,
        suffix: m.suffix,
        category: m.category,
      })),
    });
  } catch (error) {
    console.error('[PublicAPI] Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch metrics',
    });
  }
});

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: API health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
