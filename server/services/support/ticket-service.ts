import { getDb } from "../../db";
import { supportTickets, ticketMessages } from "../../../drizzle/schema";
import { eq, and, sql, desc, like, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export const ticketService = {
  /**
   * Create a new support ticket
   */
  async createTicket(data: {
    userId?: number;
    userName?: string;
    userEmail: string;
    subject: string;
    description: string;
    category?: "billing" | "technical" | "account" | "feature_request" | "bug_report" | "general";
    priority?: "low" | "medium" | "high" | "urgent";
  }) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const ticketNumber = `TKT-${nanoid(8).toUpperCase()}`;
    
    const [result] = await db.insert(supportTickets).values({
      ticketNumber,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      subject: data.subject,
      description: data.description,
      category: data.category || "general",
      priority: data.priority || "medium",
      status: "open",
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });
    
    return { ticketNumber, id: result.insertId };
  },

  /**
   * Add a message to a ticket
   */
  async addMessage(data: {
    ticketId: number;
    senderId?: number;
    senderName: string;
    senderEmail?: string;
    message: string;
    isStaff?: boolean;
  }) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db.insert(ticketMessages).values({
      ticketId: data.ticketId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      message: data.message,
      isStaff: data.isStaff ? 1 : 0,
    createdAt: Date.now(),
  });
    
    // Update ticket's updatedAt and first response time if staff
    if (data.isStaff) {
      const ticket = await db
        .select({ firstResponseAt: supportTickets.firstResponseAt })
        .from(supportTickets)
        .where(eq(supportTickets.id, data.ticketId))
        .limit(1);
      
      if (ticket.length > 0 && !ticket[0].firstResponseAt) {
        await db
          .update(supportTickets)
          .set({ firstResponseAt: Date.now() })
          .where(eq(supportTickets.id, data.ticketId));
      }
    }
    
    return true;
  },

  /**
   * Update ticket status
   */
  async updateStatus(ticketId: number, status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed", resolution?: string) {
    const db = await getDb();
    if (!db) return false;
    
    const updateData: Record<string, unknown> = { status };
    
    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
      if (resolution) updateData.resolution = resolution;
    }
    
    await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, ticketId));
    
    return true;
  },

  /**
   * Assign ticket to staff
   */
  async assignTicket(ticketId: number, assignedToId: number, assignedToName: string) {
    const db = await getDb();
    if (!db) return false;
    
    await db
      .update(supportTickets)
      .set({
        assignedToId,
        assignedToName,
        status: "in_progress",
      })
      .where(eq(supportTickets.id, ticketId));
    
    return true;
  },

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: number) {
    const db = await getDb();
    if (!db) return null;
    
    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId))
      .limit(1);
    
    return tickets.length > 0 ? tickets[0] : null;
  },

  /**
   * Get ticket by number
   */
  async getTicketByNumber(ticketNumber: string) {
    const db = await getDb();
    if (!db) return null;
    
    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.ticketNumber, ticketNumber))
      .limit(1);
    
    return tickets.length > 0 ? tickets[0] : null;
  },

  /**
   * Get ticket messages
   */
  async getMessages(ticketId: number) {
    const db = await getDb();
    if (!db) return [];
    
    return db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt);
  },

  /**
   * Get user's tickets
   */
  async getUserTickets(userId: number, limit = 50) {
    const db = await getDb();
    if (!db) return [];
    
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt))
      .limit(limit);
  },

  /**
   * Get all tickets (admin)
   */
  async getAllTickets(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const db = await getDb();
    if (!db) return { tickets: [], total: 0 };
    
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(supportTickets.status, filters.status as any));
    }
    if (filters?.category) {
      conditions.push(eq(supportTickets.category, filters.category as any));
    }
    if (filters?.priority) {
      conditions.push(eq(supportTickets.priority, filters.priority as any));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(supportTickets.subject, `%${filters.search}%`),
          like(supportTickets.ticketNumber, `%${filters.search}%`),
          like(supportTickets.userEmail, `%${filters.search}%`)
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const tickets = await db
      .select()
      .from(supportTickets)
      .where(whereClause)
      .orderBy(desc(supportTickets.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);
    
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(whereClause);
    
    return {
      tickets,
      total: countResult[0]?.count || 0,
    };
  },

  /**
   * Get ticket stats
   */
  async getStats() {
    const db = await getDb();
    if (!db) return { open: 0, inProgress: 0, resolved: 0, avgResponseTime: 0 };
    
    const stats = await db
      .select({
        open: sql<number>`SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
        waitingCustomer: sql<number>`SUM(CASE WHEN status = 'waiting_customer' THEN 1 ELSE 0 END)`,
        resolved: sql<number>`SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END)`,
        closed: sql<number>`SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(supportTickets);
    
    return stats[0] || { open: 0, inProgress: 0, waitingCustomer: 0, resolved: 0, closed: 0, total: 0 };
  },
};
