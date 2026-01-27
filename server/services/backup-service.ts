/**
 * Backup Service
 * Automated backup of critical data to S3 storage
 */

import { getDb } from '../db';
import { storagePut } from '../storage';
import { 
  users, 
  leads,
  contacts,
  calculations,
  auditLogs,
  newsletterSubscribers,
  ebookDownloads,
  whitepaperDownloads,
  jarvisSessions,
  jarvisMessages,
  knowledgeDocuments
} from '../../drizzle/schema';

interface BackupResult {
  success: boolean;
  timestamp: number;
  tables: string[];
  fileKey?: string;
  url?: string;
  error?: string;
  recordCounts: Record<string, number>;
}

interface BackupOptions {
  tables?: string[];
  includeAuditLogs?: boolean;
  compress?: boolean;
}

/**
 * Generate a unique backup filename
 */
function generateBackupFilename(): string {
  const now = Date.now();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `backups/impact7-backup-${timestamp}-${randomSuffix}.json`;
}

/**
 * Export all critical data from database
 */
async function exportCriticalData(options: BackupOptions = {}): Promise<{
  data: Record<string, unknown[]>;
  counts: Record<string, number>;
}> {
  const data: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  // Define which tables to backup
  const tablesToBackup = options.tables || [
    'users',
    'leads',
    'contacts',
    'calculations',
    'newsletterSubscribers',
    'ebookDownloads',
    'whitepaperDownloads',
    'jarvisSessions',
    'jarvisMessages',
    'knowledgeDocuments',
  ];
  
  // Export users (without sensitive data)
  if (tablesToBackup.includes('users')) {
    const usersData = await db.select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
    data.users = usersData;
    counts.users = usersData.length;
  }
  
  // Export leads
  if (tablesToBackup.includes('leads')) {
    const leadsData = await db.select().from(leads);
    data.leads = leadsData;
    counts.leads = leadsData.length;
  }
  
  // Export contacts
  if (tablesToBackup.includes('contacts')) {
    const contactsData = await db.select().from(contacts);
    data.contacts = contactsData;
    counts.contacts = contactsData.length;
  }
  
  // Export calculations
  if (tablesToBackup.includes('calculations')) {
    const calculationsData = await db.select().from(calculations);
    data.calculations = calculationsData;
    counts.calculations = calculationsData.length;
  }
  
  // Export newsletter subscribers
  if (tablesToBackup.includes('newsletterSubscribers')) {
    const subscribersData = await db.select().from(newsletterSubscribers);
    data.newsletterSubscribers = subscribersData;
    counts.newsletterSubscribers = subscribersData.length;
  }
  
  // Export ebook downloads
  if (tablesToBackup.includes('ebookDownloads')) {
    const ebookData = await db.select().from(ebookDownloads);
    data.ebookDownloads = ebookData;
    counts.ebookDownloads = ebookData.length;
  }
  
  // Export whitepaper downloads
  if (tablesToBackup.includes('whitepaperDownloads')) {
    const whitepaperData = await db.select().from(whitepaperDownloads);
    data.whitepaperDownloads = whitepaperData;
    counts.whitepaperDownloads = whitepaperData.length;
  }
  
  // Export jarvis sessions
  if (tablesToBackup.includes('jarvisSessions')) {
    const sessionsData = await db.select().from(jarvisSessions);
    data.jarvisSessions = sessionsData;
    counts.jarvisSessions = sessionsData.length;
  }
  
  // Export jarvis messages
  if (tablesToBackup.includes('jarvisMessages')) {
    const messagesData = await db.select().from(jarvisMessages);
    data.jarvisMessages = messagesData;
    counts.jarvisMessages = messagesData.length;
  }
  
  // Export knowledge documents
  if (tablesToBackup.includes('knowledgeDocuments')) {
    const docsData = await db.select().from(knowledgeDocuments);
    data.knowledgeDocuments = docsData;
    counts.knowledgeDocuments = docsData.length;
  }
  
  // Optionally include audit logs
  if (options.includeAuditLogs) {
    const auditData = await db.select().from(auditLogs);
    data.auditLogs = auditData;
    counts.auditLogs = auditData.length;
  }
  
  return { data, counts };
}

/**
 * Create a full backup of critical data
 */
export async function createBackup(options: BackupOptions = {}): Promise<BackupResult> {
  const timestamp = Date.now();
  
  try {
    // Export data
    const { data, counts } = await exportCriticalData(options);
    
    // Create backup object with metadata
    const backupData = {
      version: '1.0',
      createdAt: timestamp.toISOString(),
      platform: 'IMPACT7',
      tables: Object.keys(data),
      recordCounts: counts,
      data,
    };
    
    // Convert to JSON
    const jsonContent = JSON.stringify(backupData, null, 2);
    
    // Generate filename and upload to S3
    const fileKey = generateBackupFilename();
    const { url } = await storagePut(
      fileKey,
      Buffer.from(jsonContent, 'utf-8'),
      'application/json'
    );
    
    return {
      success: true,
      timestamp,
      tables: Object.keys(data),
      fileKey,
      url,
      recordCounts: counts,
    };
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      timestamp,
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      recordCounts: {},
    };
  }
}

/**
 * Create incremental backup (only changed records since last backup)
 */
export async function createIncrementalBackup(
  sinceTimestamp: Date,
  options: BackupOptions = {}
): Promise<BackupResult> {
  const timestamp = Date.now();
  
  try {
    // For incremental backup, we would need updatedAt tracking
    // This is a simplified version that backs up all data
    // In production, you'd filter by updatedAt > sinceTimestamp
    
    const { data, counts } = await exportCriticalData(options);
    
    const backupData = {
      version: '1.0',
      type: 'incremental',
      createdAt: timestamp.toISOString(),
      sinceTimestamp: sinceTimestamp.toISOString(),
      platform: 'IMPACT7',
      tables: Object.keys(data),
      recordCounts: counts,
      data,
    };
    
    const jsonContent = JSON.stringify(backupData, null, 2);
    const fileKey = `backups/impact7-incremental-${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
    
    const { url } = await storagePut(
      fileKey,
      Buffer.from(jsonContent, 'utf-8'),
      'application/json'
    );
    
    return {
      success: true,
      timestamp,
      tables: Object.keys(data),
      fileKey,
      url,
      recordCounts: counts,
    };
  } catch (error) {
    console.error('Incremental backup failed:', error);
    return {
      success: false,
      timestamp,
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      recordCounts: {},
    };
  }
}

/**
 * List available backups
 */
export async function listBackups(): Promise<{
  backups: Array<{
    key: string;
    timestamp: string;
    type: string;
  }>;
}> {
  // In a real implementation, this would list files from S3
  // For now, return empty array as we don't have list capability
  return { backups: [] };
}

/**
 * Schedule automatic backup (to be called by cron job or scheduler)
 */
export async function scheduleBackup(): Promise<void> {
  console.log('[Backup] Starting scheduled backup...');
  
  const result = await createBackup({
    includeAuditLogs: true,
  });
  
  if (result.success) {
    console.log(`[Backup] Completed successfully. File: ${result.fileKey}`);
    console.log(`[Backup] Record counts:`, result.recordCounts);
  } else {
    console.error(`[Backup] Failed: ${result.error}`);
  }
}

export default {
  createBackup,
  createIncrementalBackup,
  listBackups,
  scheduleBackup,
};
